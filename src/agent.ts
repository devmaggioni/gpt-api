import OpenAI from "openai";
import { left, right, type Either } from "@devmaggioni/either-monad";
import type { TRequestSchema } from "./zodSchemas.js";

type TAssistantResponse = {
  role: "assistant";
  content: string;
  refusal: any;
  annotations: any;
};

// Cache de histórico por usuário
const conversationHistory = new Map<
  string,
  { role: string; content: string }[]
>();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 2 * 60 * 1000,
  logLevel: "info",
});

const HISTORY_LIMIT = Number(process.env?.HISTORY_LIMIT ?? 20);

export async function talkWithGPT(config: TRequestSchema): Promise<
  Either<
    any,
    {
      response: TAssistantResponse;
      history?: { role: string; content: string }[];
    }
  >
> {
  const userId = config.userId ?? "unknown_user";

  // Se useMemory for falso, resetamos o histórico para apenas o systemPrompt
  if (!config.useMemory) {
    conversationHistory.set(userId, [
      { role: "system", content: config.systemPrompt ?? "" },
    ]);
  } else if (!conversationHistory.has(userId)) {
    // Se useMemory for verdadeiro e não existe histórico, inicializa
    conversationHistory.set(userId, [
      { role: "system", content: config.systemPrompt ?? "" },
    ]);
  }

  const history = config.useMemory
    ? (conversationHistory.get(userId)! as any)
    : [
        { role: "system", content: config.systemPrompt ?? "" },
        { role: "user", content: config.userPrompt },
      ];

  // Adiciona mensagem do usuário apenas se estivermos usando memória
  if (config.useMemory) {
    history.push({ role: "user", content: config.userPrompt });
  }

  try {
    const data = await client.chat.completions.create({
      model: config?.model ?? "gpt-4.1-mini",
      messages: history,
      temperature: config?.temperature ?? 0.6,
      stream: false,
    });

    const hasMessage = data.choices[0]?.message;
    if (hasMessage) {
      const response: TAssistantResponse = {
        role: hasMessage.role,
        content: hasMessage.content ?? "",
        refusal: hasMessage.refusal ?? null,
        annotations: hasMessage?.annotations ?? [],
      };

      // Adiciona resposta do assistente apenas se estivermos usando memória
      if (config.useMemory) {
        history.push({ role: "assistant", content: response.content });
        conversationHistory.set(
          userId,
          history.slice(-HISTORY_LIMIT) // limita histórico
        );
      }

      if (config.userId) {
        return right({
          response,
          history: conversationHistory.get(userId) || [],
        });
      }
      return right({ response });
    }

    return left(
      "The answer did not come out as expected:\n" + JSON.stringify(hasMessage)
    );
  } catch (e: any) {
    return left(e.message);
  }
}

// Função auxiliar para resetar histórico manualmente a qualquer momento
export function resetUserHistory(userId: string, systemPrompt: string = "") {
  conversationHistory.set(userId, [{ role: "system", content: systemPrompt }]);
}
