import type { RunnerTestFile } from "vitest";
import { it } from "vitest";
import levenshtein from "js-levenshtein";

type MaybePromise<T> = T | Promise<T>;

declare module "vitest" {
  interface TaskMeta {
    evalite?: {
      results: {
        input: unknown;
        result: unknown;
        scores: {
          score: number;
          name: string;
        }[];
      }[];
    };
  }
}

export const evalite = <T>(
  testName: string,
  opts: {
    data: () => MaybePromise<{ input: T; expected?: T }[]>;
    task: (input: T) => MaybePromise<T>;
    scores: ((opts: { output: T; expected?: T }) => MaybePromise<{
      score: number;
      name: string;
    }>)[];
  }
) => {
  return it(testName, async ({ task }) => {
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
    }
  });
};

export const Levenshtein = (args: { output: string; expected?: string }) => {
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
