import { getJsonDbEvals, type Evalite } from "@evalite/core";
import { fastifyStatic } from "@fastify/static";
import { fastifyWebsocket } from "@fastify/websocket";
import fastify from "fastify";
import path from "path";

export type Server = ReturnType<typeof createServer>;

export const createServer = (opts: { jsonDbLocation: string }) => {
  const UI_ROOT = path.join(import.meta.dirname, "./ui");
  const server = fastify();

  server.register(fastifyWebsocket);
  server.register(fastifyStatic, {
    root: path.join(UI_ROOT),
  });

  const listeners = new Map<string, (event: Evalite.WebsocketEvent) => void>();

  server.setNotFoundHandler(async (req, res) => {
    res.sendFile(path.join(UI_ROOT, "index.html"));
  });

  server.get("/api/evals", async (req, reply) => {
    return reply
      .code(200)
      .header("access-control-allow-origin", "*")
      .send(await getJsonDbEvals({ dbLocation: opts.jsonDbLocation }));
  });

  server.register(async (fastify) => {
    fastify.get("/api/socket", { websocket: true }, (socket, req) => {
      listeners.set(req.id, (event) => {
        socket.send(JSON.stringify(event));
      });

      socket.on("close", () => {
        listeners.delete(req.id);
      });
    });
  });

  server.route<{
    Querystring: {
      name: string;
    };
  }>({
    method: "GET",
    url: "/api/eval",
    schema: {
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      },
    },
    handler: async (req, res) => {
      const name = req.query.name;

      const fileData = await getJsonDbEvals({
        dbLocation: opts.jsonDbLocation,
      });

      if (!fileData) {
        return res.code(404).send();
      }

      return res
        .code(200)
        .header("access-control-allow-origin", "*")
        .send(fileData[name] ?? []);
    },
  });

  server.route<{
    Querystring: {
      name: string;
      timestamp: string;
    };
  }>({
    method: "GET",
    url: "/api/eval/run",
    schema: {
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
          timestamp: { type: "string" },
        },
      },
    },
    handler: async (req, res) => {
      const timestamp = req.query.timestamp;

      const fileData = await getJsonDbEvals({
        dbLocation: opts.jsonDbLocation,
      });

      const run = fileData[req.query.name]?.find(
        (item) => item.startTime === timestamp
      );

      if (!run) {
        return res.code(404).send();
      }

      return res.code(200).header("access-control-allow-origin", "*").send(run);
    },
  });

  return {
    send: (event: Evalite.WebsocketEvent) => {
      for (const listener of listeners.values()) {
        listener(event);
      }
    },
    start: (port: number) => {
      server.listen(
        {
          port,
        },
        (err) => {
          if (err) {
            server.log.error(err);
            process.exit(1);
          }
        }
      );
    },
  };
};
