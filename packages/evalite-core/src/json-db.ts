import { appendFile, readFile } from "fs/promises";
import type { Evalite } from "./index.js";
import { average } from "./utils.js";

export type JsonDBEval = {
  name: string;
  score: number;
  startTime: string;
  duration: number;
  results: JsonDbResult[];
  sourceCodeHash: string;
};

export type JsonDbResult = {
  input: unknown;
  expected: unknown;
  result: unknown;
  scores: Evalite.Score[];
  duration: number;
  score: number;
  traces: Evalite.UserProvidedTrace[];
};

export const appendToJsonDb = async (opts: {
  dbLocation: string;
  files: {
    name: string;
    tasks: {
      name: string;
      meta: {
        evalite?: Evalite.TaskMeta;
      };
    }[];
  }[];
}) => {
  const datetime = new Date().toISOString();
  const evals: JsonDBEval[] = [];

  for (const file of opts.files) {
    for (const task of file.tasks) {
      const jsonDbTask: JsonDBEval = {
        name: task.name,
        score: average(task.meta.evalite?.results || [], (t) => {
          return average(t.scores, (s) => s.score ?? 0);
        }),
        duration: task.meta.evalite?.duration ?? 0,
        results: [],
        startTime: datetime,
        sourceCodeHash: task.meta.evalite?.sourceCodeHash ?? "",
      };

      if (task.meta.evalite) {
        for (const { input, result, scores, duration, expected } of task.meta
          .evalite.results) {
          jsonDbTask.results.push({
            input,
            result,
            expected,
            scores,
            duration,
            score: average(scores, (s) => s.score ?? 0),
            traces: task.meta.evalite.traces,
          });
        }
      }

      evals.push(jsonDbTask);
    }
  }

  await appendFile(
    opts.dbLocation,
    evals.map((evaluation) => JSON.stringify(evaluation)).join("\n") + "\n",
    {
      encoding: "utf-8",
    }
  );
};

export type GetJsonDbEvalsResult = Record<string, JsonDBEval[]>;

export const getJsonDbEvals = async (opts: {
  dbLocation: string;
}): Promise<GetJsonDbEvalsResult> => {
  const map: GetJsonDbEvalsResult = {};

  await getRows({
    dbLocation: opts.dbLocation,
    mapper: (row) => {
      const evalName = row.name;

      if (!map[evalName]) {
        map[evalName] = [];
      }

      map[evalName]!.unshift(row);
    },
  });

  return map;
};

export const getRows = async <T>(opts: {
  dbLocation: string;
  mapper: (row: JsonDBEval) => T;
}): Promise<T[]> => {
  const dbContents = await readFile(opts.dbLocation, { encoding: "utf-8" });

  return dbContents
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const parsed: JsonDBEval = JSON.parse(line);

      return opts.mapper(parsed);
    });
};
