import type { FastifyInstance } from "fastify";
import { requestSchema } from "../../zodSchemas.js";
import { talkWithGPT } from "../../agent.js";

export async function gptRoutesV1(app: FastifyInstance) {
  app.post(
    "/v1/gpt",
    {
      preHandler: (req, res, done) => {
        const key = (req.query as { apiKey?: string }).apiKey;
        if (key !== process.env.APP_API_KEY) {
          res.status(401).send({
            statusCode: 401,
            error: "Unauthorized",
            details: "Missing apiKey",
          });
          return;
        }

        done();
      },
    },
    async (req, res) => {
      const safeParse = requestSchema.safeParse(req.body);
      if (!safeParse.success)
        return res.status(400).send({
          statusCode: 400,
          error: "Validation Error",
          details: safeParse.error.flatten((issue) => issue.message),
        });

      try {
        const data = await talkWithGPT({
          temperature: Number(safeParse.data.temperature) ?? null,
          systemPrompt: safeParse.data.systemPrompt,
          userPrompt: safeParse.data.userPrompt,
          useMemory: safeParse.data.useMemory ?? false,
        });
        if (data.r) {
          return res.code(200).send({
            statusCode: 200,
            response: data.value.response,
          });
        }
        return res.code(500).send({
          statusCode: 500,
          error: "Somethins is wrong with this request",
          details: data,
        });
      } catch (e: any) {
        return res.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          details: e.message,
        });
      }
    }
  );
}
