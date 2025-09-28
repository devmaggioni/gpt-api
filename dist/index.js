import "dotenv/config";
import Fastify from "fastify";
const app = Fastify({ logger: true });
// READ ALL
app.get("/", (req, res) => {
    return res.send("Olá mundo!");
});
// START SERVER
app.listen({ port: Number(process.env.PORT) }).then(() => {
    console.log("Server running at http://localhost:" + Number(process.env.PORT));
});
//# sourceMappingURL=index.js.map