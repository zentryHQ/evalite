import { appendFile, readFile } from "fs/promises";
import { average } from "./utils.js";
import type { Evalite } from "./index.js";

export type JsonDBRun = {
  id: string;
  datetime: string;
  files: JsonDBFile[];
};

export type JsonDBFile = {
  file: string;
  score: number;
  tasks: JsonDBTask[];
};

export type JsonDBTask = {
  task: string;
  score: number;
  duration: number;
  results: {
    input: unknown;
    expected: unknown;
    result: unknown;
    scores: Evalite.Score[];
    duration: number;
  }[];
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
  const jsonDbRun: JsonDBRun = {
    id: crypto.randomUUID(),
    datetime: new Date().toISOString(),
    files: [],
  };

  for (const file of opts.files) {
    const jsonDbFile: JsonDBFile = {
      file: file.name,
      score: average(file.tasks, (task) => {
        return average(task.meta.evalite?.results || [], (t) => {
          return average(t.scores, (s) => s.score);
        });
      }),
      tasks: [],
    };
    for (const task of file.tasks) {
      const jsonDbTask: JsonDBTask = {
        task: task.name,
        score: average(task.meta.evalite?.results || [], (t) => {
          return average(t.scores, (s) => s.score);
        }),
        duration: task.meta.evalite?.duration ?? 0,
        results: [],
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
          });
        }
      }

      jsonDbFile.tasks.push(jsonDbTask);
    }

    jsonDbRun.files.push(jsonDbFile);
  }

  await appendFile(opts.dbLocation, JSON.stringify(jsonDbRun) + "\n", {
    encoding: "utf-8",
  });
};

export const getJsonDbRuns = async (opts: {
  dbLocation: string;
}): Promise<JsonDBRun[]> => {
  const dbContents = await readFile(opts.dbLocation, { encoding: "utf-8" });

  return dbContents
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
};
