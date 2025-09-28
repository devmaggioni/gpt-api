import type { FastifyInstance } from "fastify";

export function healthRoute(app: FastifyInstance) {
  app.get("/health", async (req, res) => {
    const byteToMB = (by: number) => {
      return (by / (1024 * 1024)).toFixed(2) + "MB";
    };
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      return {
        status: "ok",
        uptime: `${uptime.toFixed(2)}s`,
        memory: {
          rss: byteToMB(memoryUsage.rss),
          heapTotal: byteToMB(memoryUsage.heapTotal),
          heapUsed: byteToMB(memoryUsage.heapUsed),
        },
      };
    } catch (err) {
      return res.status(500).send({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });
}
