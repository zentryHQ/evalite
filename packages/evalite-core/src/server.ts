import { fastifyStatic } from "@fastify/static";
import { fastifyWebsocket } from "@fastify/websocket";
import fastify from "fastify";
import path from "path";
import {
  getAverageScoresFromResults,
  getEvals,
  getEvalsAverageScores,
  getMostRecentEvalByName,
  getMostRecentRun,
  getPreviousEvalRun,
  getResults,
  getScores,
  getTraces,
  type SQLiteDatabase,
} from "./db.js";
import {
  type GetEvalByNameResult,
  type GetMenuItemsResult,
  type GetResultResult,
} from "./sdk.js";
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

  server.get<{
    Reply: GetMenuItemsResult;
  }>("/api/menu-items", async (req, reply) => {
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
    Reply: GetEvalByNameResult;
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

      const evaluation = getMostRecentEvalByName(opts.db, name);

      if (!evaluation) {
        return res.code(404).send();
      }

      const prevEvaluation = getPreviousEvalRun(
        opts.db,
        name,
        evaluation.created_at
      );

      const results = getResults(
        opts.db,
        [evaluation.id, prevEvaluation?.id].filter((i) => typeof i === "number")
      );

      const scores = getScores(
        opts.db,
        results.map((r) => r.id)
      );

      return res
        .code(200)
        .header("access-control-allow-origin", "*")
        .send({
          history: [], // TODO when we enable chart
          evaluation: {
            ...evaluation,
            results: results
              .filter((r) => r.eval_id === evaluation.id)
              .map((r) => ({
                ...r,
                scores: scores.filter((s) => s.result_id === r.id),
              })),
          },
          prevEvaluation: prevEvaluation
            ? {
                ...prevEvaluation,
                results: results
                  .filter((r) => r.eval_id === prevEvaluation.id)
                  .map((r) => ({
                    ...r,
                    scores: scores.filter((s) => s.result_id === r.id),
                  })),
              }
            : undefined,
        });
    },
  });

  server.route<{
    Querystring: {
      name: string;
      index: string;
    };
    Reply: GetResultResult;
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
      const evaluation = getMostRecentEvalByName(opts.db, req.query.name);

      if (!evaluation) {
        return res.code(404).send();
      }

      const prevEvaluation = getPreviousEvalRun(
        opts.db,
        req.query.name,
        evaluation.created_at
      );

      const results = getResults(
        opts.db,
        [evaluation.id, prevEvaluation?.id].filter((i) => typeof i === "number")
      );

      const thisEvaluationResults = results.filter(
        (r) => r.eval_id === evaluation.id
      );

      const thisResult = thisEvaluationResults[Number(req.query.index)];

      if (!thisResult) {
        return res.code(404).send();
      }

      const prevEvaluationResults = results.filter(
        (r) => r.eval_id === prevEvaluation?.id
      );

      const averageScores = getAverageScoresFromResults(
        opts.db,
        results.map((r) => r.id)
      );

      const scores = getScores(
        opts.db,
        results.map((r) => r.id)
      );

      const traces = getTraces(
        opts.db,
        results.map((r) => r.id)
      );

      const result: GetResultResult["result"] = {
        ...thisResult,
        score:
          averageScores.find((s) => s.result_id === thisResult.id)?.average ??
          0,
        scores: scores.filter((s) => s.result_id === thisResult.id),
        traces: traces.filter((t) => t.result_id === thisResult.id),
      };

      const prevResultInDb = prevEvaluationResults[Number(req.query.index)];

      const prevResult: GetResultResult["prevResult"] = prevResultInDb
        ? {
            ...prevResultInDb,
            score:
              averageScores.find((s) => s.result_id === prevResultInDb.id)
                ?.average ?? 0,
            scores: scores.filter((s) => s.result_id === prevResultInDb.id),
          }
        : undefined;

      return res
        .code(200)
        .header("access-control-allow-origin", "*")
        .send({ result, prevResult, filepath: evaluation.filepath });
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
