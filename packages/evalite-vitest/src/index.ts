import levenshtein from "js-levenshtein";
import { it } from "vitest";

type MaybePromise<T> = T | Promise<T>;

declare module "vitest" {
  interface TaskMeta {
    evalite?: Evalite.TaskMeta;
  }
}

export declare namespace Evalite {
  export type Result = {
    input: unknown;
    result: unknown;
    scores: Score[];
  };

  export type TaskReport = {
    file: string;
    task: string;
    input: unknown;
    result: unknown;
    scores: Score[];
  };

  export type Score = {
    score: number;
    name: string;
  };

  export type ScoreInput<T> = {
    output: T;
    expected?: T;
  };

  export type TaskMeta = {
    results: Result[];
  };

  export type Scorer<T> = (opts: ScoreInput<T>) => MaybePromise<Score>;

  export type RunnerOpts<T> = {
    data: () => MaybePromise<{ input: T; expected?: T }[]>;
    task: (input: T) => MaybePromise<T>;
    scores: Scorer<T>[];
  };
}

export const evalite = <T>(testName: string, opts: Evalite.RunnerOpts<T>) => {
  return it(testName, async ({ task }) => {
    if (!task.file.meta.evalite) {
      task.file.meta.evalite = { results: [] };
    }
    task.meta.evalite = { results: [] };
    for (const { input, expected } of await opts.data()) {
      const result = await opts.task(input);

      const scores: {
        score: number;
        name: string;
      }[] = [];

      for (const score of opts.scores) {
        scores.push(await score({ output: result, expected }));
      }

      task.meta.evalite.results.push({
        input,
        result,
        scores,
      });

      task.file.meta.evalite.results.push({
        input,
        result,
        scores,
      });
    }
  });
};

export const Levenshtein = (args: Evalite.ScoreInput<string>) => {
  if (args.expected === undefined) {
    throw new Error("LevenshteinScorer requires an expected value");
  }

  const [output, expected] = [`${args.output}`, `${args.expected}`];
  const maxLen = Math.max(output.length, expected.length);

  let score = 1;
  if (maxLen > 0) {
    score = 1 - levenshtein(output, expected) / maxLen;
  }

  return {
    name: "Levenshtein",
    score,
  };
};
