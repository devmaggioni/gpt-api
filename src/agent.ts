import OpenAI from "openai";
import { left, right, type Either } from "@devmaggioni/either-monad";
import type { TRequestSchema } from "./zodSchemas";

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

const HISTORY_LIMIT = process.env?.HISTORY_LIMIT || 20;

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

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: config.systemPrompt },
    ]);
  }

  const history = conversationHistory.get(userId)! as any;

  // Adiciona mensagem do usuário
  history.push({
    role: "user",
    content: config.userPrompt,
  });

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

      // Adiciona resposta do assistente
      history.push({
        role: "assistant",
        content: response.content,
      });

      // Limita o histórico para as últimas 50 mensagens
      conversationHistory.set(userId, history.slice(-HISTORY_LIMIT));

      if (config.useMemory) {
        return right({
          response,
          history: conversationHistory.get(userId) || [],
        });
      }

      return right({ response });
    }

    return left(
      "the answer did not come out as expected:\n " + JSON.stringify(hasMessage)
    );
  } catch (e: any) {
    return left(e.message);
  }
}
