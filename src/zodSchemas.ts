import { z } from "zod";

export const requestSchema = z.object({
  systemPrompt: z.string().min(1),
  userPrompt: z.string().min(1),
  model: z.string().min(1).optional(),
  temperature: z.number().positive().max(1).optional(),
  useMemory: z.boolean().optional(),
  userId: z.string().optional(),
});

export type TRequestSchema = z.infer<typeof requestSchema>;
