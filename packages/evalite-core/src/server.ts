import { fastifyStatic } from "@fastify/static";
import { fastifyWebsocket } from "@fastify/websocket";
import fastify from "fastify";
import path from "path";
import {
  getEvals,
  getEvalsAsRecord,
  getEvalsAverageScores,
  getMostRecentRun,
  getPreviousEvalRun,
  type SQLiteDatabase,
} from "./db.js";
import type { GetMenuItemsResult } from "./sdk.js";
import type { Evalite } from "./types.js";

export type Server = ReturnType<typeof createServer>;

export const createServer = (opts: { db: SQLiteDatabase }) => {
  const UI_ROOT = path.join(import.meta.dirname, "./ui");
  const server = fastify();

  server.register(fastifyWebsocket);
  server.register(fastifyStatic, {
    root: path.join(UI_ROOT),
  });

  server.setNotFoundHandler(async (req, reply) => {
    return reply.status(200).sendFile("index.html");
  });

  const listeners = new Map<string, (event: Evalite.WebsocketEvent) => void>();

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

  server.get("/api/menu-items", async (req, reply) => {
    let lastRun = getMostRecentRun(opts.db, "full");

    let evalsToSend: GetMenuItemsResult["evals"] = [];

    if (!lastRun) {
      lastRun = getMostRecentRun(opts.db, "partial");
    }

    if (lastRun) {
      const evals = getEvals(opts.db, lastRun.id).map((e) => ({
        ...e,
        prevEval: getPreviousEvalRun(opts.db, e.name, e.created_at),
      }));

      const evalsAverageScores = getEvalsAverageScores(
        opts.db,
        evals.flatMap((e) => {
          if (e.prevEval) {
            return [e.id, e.prevEval.id];
          }
          return [e.id];
        })
      );

      evalsToSend = evals.map((e) => {
        const score =
          evalsAverageScores.find((s) => s.eval_id === e.id)?.average ?? 0;
        const prevScore =
          evalsAverageScores.find((s) => s.eval_id === e.prevEval?.id)
            ?.average ?? 0;

        return {
          filepath: e.filepath,
          name: e.name,
          score,
          prevScore,
        };
      });
    }

    const result: GetMenuItemsResult = {
      evals: evalsToSend,
    };

    return reply
      .code(200)
      .header("access-control-allow-origin", "*")
      .send(result);
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

      const fileData = await getEvalsAsRecord(opts.db);

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

      const fileData = await getEvalsAsRecord(opts.db);

      const run = fileData[req.query.name]?.find(
        (item) => item.created_at === timestamp
      );

      if (!run) {
        return res.code(404).send();
      }

      return res.code(200).header("access-control-allow-origin", "*").send(run);
    },
  });

  server.route<{
    Querystring: {
      name: string;
      index: string;
    };
  }>({
    method: "GET",
    url: "/api/eval/result",
    schema: {
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
          index: { type: "string" },
        },
      },
    },
    handler: async (req, res) => {
      const index = parseInt(req.query.index, 10);

      const fileData = await getEvalsAsRecord(opts.db);

      const run = fileData[req.query.name]?.[0];

      if (!run) {
        return res.code(404).send();
      }

      const result = run.results[index];

      if (!result) {
        return res.code(404).send();
      }

      const previousRun = fileData[req.query.name]?.[1];

      const prevResult = previousRun?.results[index];

      return res
        .code(200)
        .header("access-control-allow-origin", "*")
        .send({ result, prevResult, filepath: run.filepath });
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
            console.error(err);
            process.exit(1);
          }
        }
      );
    },
  };
};
