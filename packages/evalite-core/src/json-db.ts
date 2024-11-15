import { appendFile, readFile } from "fs/promises";
import { average, max } from "./utils.js";
import type { Evalite } from "./index.js";

export type JsonDBFileResult = {
  file: string;
  datetime: string;
  score: number;
  tasks: JsonDBTask[];
  duration: number;
};

export type JsonDbResult = {
  input: unknown;
  expected: unknown;
  result: unknown;
  scores: Evalite.Score[];
  duration: number;
  score: number;
};

export type JsonDBTask = {
  task: string;
  score: number;
  duration: number;
  results: JsonDbResult[];
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
  const files: JsonDBFileResult[] = [];

  for (const file of opts.files) {
    const jsonDbFile: JsonDBFileResult = {
      file: file.name,
      datetime,
      score: average(file.tasks, (task) => {
        return average(task.meta.evalite?.results || [], (t) => {
          return average(t.scores, (s) => s.score);
        });
      }),
      tasks: [],
      duration: max(file.tasks, (task) => task.meta.evalite?.duration || 0),
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
            score: average(scores, (s) => s.score),
          });
        }
      }

      jsonDbFile.tasks.push(jsonDbTask);
    }

    files.push(jsonDbFile);
  }

  await appendFile(
    opts.dbLocation,
    files.map((file) => JSON.stringify(file)).join("\n") + "\n",
    {
      encoding: "utf-8",
    }
  );
};

export type GetJsonDbFilesResult = Record<string, JsonDBFileResult[]>;

export const getJsonDbFiles = async (opts: {
  dbLocation: string;
}): Promise<GetJsonDbFilesResult> => {
  const dbContents = await readFile(opts.dbLocation, { encoding: "utf-8" });

  const map: GetJsonDbFilesResult = {};

  await getRows({
    dbLocation: opts.dbLocation,
    mapper: (row) => {
      const filename = row.file;

      if (!map[filename]) {
        map[filename] = [];
      }

      map[filename]!.unshift(row);
    },
  });

  return map;
};

const getRows = async <T>(opts: {
  dbLocation: string;
  mapper: (row: JsonDBFileResult) => T;
}): Promise<T[]> => {
  const dbContents = await readFile(opts.dbLocation, { encoding: "utf-8" });

  return dbContents
    .trim()
    .split("\n")
    .map((line) => {
      const parsed: JsonDBFileResult = JSON.parse(line);

      return opts.mapper(parsed);
    });
};

export type TasksMap = Record<string, JsonDBTask[]>;

export const getJsonDbFile = async (opts: {
  dbLocation: string;
  file: string;
}): Promise<TasksMap> => {
  const tasks: TasksMap = {};

  await getRows({
    dbLocation: opts.dbLocation,
    mapper: (row) => {
      if (row.file !== opts.file) return;

      row.tasks.forEach((task) => {
        const taskName = task.task;
        if (!tasks[taskName]) {
          tasks[taskName] = [];
        }

        tasks[taskName].unshift(task);
      });
    },
  });

  return tasks;
};
