import type { Evalite } from "@evalite/core";
import levenshtein from "js-levenshtein";
import { it } from "vitest";

declare module "vitest" {
  interface TaskMeta {
    evalite?: Evalite.TaskMeta;
  }
}

const runTask = async <TInput, TExpected>(opts: {
  input: TInput;
  expected: TExpected | undefined;
  task: (input: TInput) => Evalite.MaybePromise<TExpected>;
  scores: Evalite.Scorer<TExpected>[];
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

export const evalite = <TInput, TExpected>(
  testName: string,
  opts: Evalite.RunnerOpts<TInput, TExpected>
) => {
  return it(testName, async ({ task }) => {
    if (opts.scorers.length === 0) {
      throw new Error("You must provide at least one scorer.");
    }

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
          scores: opts.scorers,
          task: opts.task,
        });

        task.meta.evalite!.results.push({
          input,
          result,
          scores,
          duration,
          expected,
        });

        task.file.meta.evalite!.results.push({
          input,
          result,
          scores,
          duration,
          expected,
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

export const numericDifference = (args: Evalite.ScoreInput<number>) => {
  if (args.expected === undefined) {
    throw new Error("NumericDifferenceScorer requires an expected value");
  }

  return {
    name: "NumericDifference",
    score: 1 - Math.abs(args.output - args.expected) / args.expected,
  };
};
