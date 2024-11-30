import { getJsonDbEvals, type Evalite } from "@evalite/core";
import { fastifyWebsocket } from "@fastify/websocket";
import fastify from "fastify";

export type Server = ReturnType<typeof createServer>;

const createServer = (opts: { jsonDbLocation: string }) => {
  const server = fastify();

  server.register(fastifyWebsocket);

  const listeners = new Map<string, (event: Evalite.WebsocketEvent) => void>();

  server.register(async (fastify) => {
    fastify.get("/socket", { websocket: true }, (socket, req) => {
      listeners.set(req.id, (event) => {
        socket.send(JSON.stringify(event));
      });

      socket.on("close", () => {
        listeners.delete(req.id);
      });
    });
  });

  server.get("/", async (req, res) => {
    res.status(200).send("Hello, world!");
  });

  server.get("/api/files", async (req, res) => {
    return res
      .status(200)
      .header("access-control-allow-origin", "*")
      .send(await getJsonDbEvals({ dbLocation: opts.jsonDbLocation }));
  });

  server.route<{
    Querystring: {
      path: string;
    };
  }>({
    method: "GET",
    url: "/api/file",
    schema: {
      querystring: {
        type: "object",
        properties: {
          path: { type: "string" },
        },
      },
    },
    handler: async (req, res) => {
      const path = req.query.path;

      const fileData = await getJsonDbEvals({
        dbLocation: opts.jsonDbLocation,
        name: path,
      });

      if (!fileData) {
        return res.status(404).send();
      }

      return res
        .status(200)
        .header("access-control-allow-origin", "*")
        .send(fileData);
    },
  });

  server.route<{
    Querystring: {
      path: string;
      task: string;
    };
  }>({
    method: "GET",
    url: "/api/task",
    schema: {
      querystring: {
        type: "object",
        properties: {
          path: { type: "string" },
          task: { type: "string" },
        },
        required: ["path", "task"],
      },
    },
    handler: async (req, res) => {
      const path = req.query.path;
      const task = req.query.task;

      const fileData = await getEvalsByName({
        dbLocation: opts.jsonDbLocation,
        file: path,
      });

      if (!fileData) {
        return res.status(404).send();
      }

      if (!fileData[task]) {
        return res.status(404).send();
      }

      return res
        .status(200)
        .header("access-control-allow-origin", "*")
        .send(fileData[task]);
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

export const runServer = (opts: { port: number; jsonDbLocation: string }) => {
  const server = createServer(opts);

  server.start(opts.port);

  return server;
};
