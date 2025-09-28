import OpenAI from "openai";
import NodeCache from "node-cache";
import { left, right, type Either } from "@devmaggioni/either-monad";
import type { TRequestSchema } from "./zodSchemas.js";

type TAssistantResponse = {
  role: "assistant";
  content: string;
  refusal: any;
  annotations: any;
};

type TMessage = {
  role: string;
  content: string;
};

type TUserConversation = {
  messages: TMessage[];
  lastSystemPrompt: string;
  createdAt: number;
  updatedAt: number;
};

// Cache sem TTL - histórico persiste até ser explicitamente removido
const conversationCache = new NodeCache({
  stdTTL: 60 * 60 * 2,
  checkperiod: 60 * 10, // Verifica itens expirados a cada 10 minutos
  useClones: true, // Clona objetos para evitar referências compartilhadas
  deleteOnExpire: true,
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 2 * 60 * 1000,
  logLevel: "info",
});

const HISTORY_LIMIT = Number(process.env?.HISTORY_LIMIT ?? 20);

// Função para gerar chave única do usuário
function getUserCacheKey(userId: string): string {
  return `conversation:${userId}`;
}

// Função para obter conversa do usuário
function getUserConversation(userId: string): TUserConversation | null {
  const cacheKey = getUserCacheKey(userId);
  return conversationCache.get<TUserConversation>(cacheKey) || null;
}

// Função para salvar conversa do usuário
function saveUserConversation(
  userId: string,
  conversation: TUserConversation
): void {
  const cacheKey = getUserCacheKey(userId);
  conversationCache.set(cacheKey, conversation);
}

// Função para inicializar nova conversa
function initializeConversation(
  userId: string,
  systemPrompt: string
): TUserConversation {
  const now = Date.now();
  const conversation: TUserConversation = {
    messages: [{ role: "system", content: systemPrompt }],
    lastSystemPrompt: systemPrompt,
    createdAt: now,
    updatedAt: now,
  };

  saveUserConversation(userId, conversation);
  return conversation;
}

// Função para atualizar conversa existente
function updateConversation(
  userId: string,
  messages: TMessage[],
  systemPrompt: string
): TUserConversation {
  const conversation: TUserConversation = {
    messages: messages.slice(-HISTORY_LIMIT), // Aplica limite
    lastSystemPrompt: systemPrompt,
    createdAt: getUserConversation(userId)?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  saveUserConversation(userId, conversation);
  return conversation;
}

export async function talkWithGPT(config: TRequestSchema): Promise<
  Either<
    any,
    {
      response: TAssistantResponse;
      history?: TMessage[];
    }
  >
> {
  // Validação de entrada
  if (!config.userId) {
    return left("userId is required");
  }

  if (!config.userPrompt) {
    return left("userPrompt is required");
  }

  const userId = config.userId.trim();
  const systemPrompt = config.systemPrompt || "";
  const userPrompt = config.userPrompt;

  let messagesToSend: TMessage[];
  let conversationToUpdate: TUserConversation | null = null;

  if (config.useMemory) {
    // Modo com memória: gerencia histórico persistente
    let userConversation = getUserConversation(userId);

    // Verifica se precisa criar nova conversa ou se system prompt mudou
    if (
      !userConversation ||
      userConversation.lastSystemPrompt !== systemPrompt
    ) {
      userConversation = initializeConversation(userId, systemPrompt);
    }

    // Clona as mensagens para evitar mutação do cache
    const currentMessages = [...userConversation.messages];
    currentMessages.push({ role: "user", content: userPrompt });

    messagesToSend = currentMessages;
    conversationToUpdate = userConversation;
  } else {
    // Modo sem memória: apenas system prompt + mensagem atual
    messagesToSend = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
  }

  try {
    const data = await client.chat.completions.create({
      model: config?.model ?? "gpt-4o-mini",
      messages: messagesToSend as any,
      temperature: config?.temperature ?? 0.6,
      stream: false,
    });

    const message = data.choices[0]?.message;
    if (!message) {
      return left("No response received from OpenAI API");
    }

    const response: TAssistantResponse = {
      role: message.role as "assistant",
      content: message.content ?? "",
      refusal: message.refusal ?? null,
      annotations: message?.annotations ?? [],
    };

    // Se usando memória, atualiza o histórico
    if (config.useMemory && conversationToUpdate) {
      messagesToSend.push({
        role: "assistant",
        content: response.content,
      });

      const updatedConversation = updateConversation(
        userId,
        messagesToSend,
        systemPrompt
      );

      return right({
        response,
        history: updatedConversation.messages,
      });
    }

    // Modo sem memória
    return right({ response });
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error occurred";
    console.error(`OpenAI API Error for user ${userId}:`, {
      error: errorMessage,
      userId,
      timestamp: new Date().toISOString(),
    });
    return left(errorMessage);
  }
}

// Única função exportada para resetar histórico
export function resetHistory(userId: string): boolean {
  if (!userId?.trim()) {
    console.warn("Cannot reset history: valid userId is required");
    return false;
  }

  try {
    const cacheKey = getUserCacheKey(userId.trim());
    conversationCache.del(cacheKey);
    console.log(`History reset successfully for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to reset history for user ${userId}:`, error);
    return false;
  }
}
