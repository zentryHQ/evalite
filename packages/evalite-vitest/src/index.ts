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
    duration: number;
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
    duration: number | undefined;
  };

  export type Scorer<T> = (opts: ScoreInput<T>) => MaybePromise<Score>;

  export type RunnerOpts<T> = {
    data: () => MaybePromise<{ input: T; expected?: T }[]>;
    task: (input: T) => MaybePromise<T>;
    scores: Scorer<T>[];
  };
}

const runTask = async <T>(opts: {
  input: T;
  expected: T | undefined;
  task: (input: T) => MaybePromise<T>;
  scores: Evalite.Scorer<T>[];
}) => {
  const start = performance.now();
  const result = await opts.task(opts.input);
  const duration = Math.round(performance.now() - start);

  const scores: {
    score: number;
    name: string;
  }[] = [];

  for (const score of opts.scores) {
    scores.push(await score({ output: result, expected: opts.expected }));
  }

  return {
    result,
    scores,
    duration,
  };
};

export const evalite = <T>(testName: string, opts: Evalite.RunnerOpts<T>) => {
  return it(testName, async ({ task }) => {
    if (!task.file.meta.evalite) {
      task.file.meta.evalite = { results: [], duration: undefined };
    }
    task.meta.evalite = { results: [], duration: undefined };
    const data = await opts.data();
    const start = performance.now();
    await Promise.all(
      data.map(async ({ input, expected }) => {
        const { result, scores, duration } = await runTask({
          expected,
          input,
          scores: opts.scores,
          task: opts.task,
        });

        task.meta.evalite!.results.push({
          input,
          result,
          scores,
          duration,
        });

        task.file.meta.evalite!.results.push({
          input,
          result,
          scores,
          duration,
        });
      })
    );
    task.meta.evalite.duration = Math.round(performance.now() - start);
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
