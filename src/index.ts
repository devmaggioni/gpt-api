import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { gptRoutesV1 } from "./routes/v1/gpt";
import { healthRoute } from "./routes/health";

const app = Fastify({ logger: process.env.NODE_ENV === "development" });

app.register(healthRoute);
app.register(gptRoutesV1);
app.register(fastifyCors, {
  origin: "*",
});

app.listen({ port: Number(process.env.PORT), host: "0.0.0.0" }).then(() => {
  console.log("Server running at http://localhost:" + Number(process.env.PORT));
});
