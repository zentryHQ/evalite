import type { Evalite } from "@evalite/core";
import { inject, it } from "vitest";
import { reportTraceLocalStorage } from "./traces.js";

declare module "vitest" {
  interface TaskMeta {
    evalite?: Evalite.TaskMeta;
  }
}

const runTask = async <TInput, TExpected>(opts: {
  input: TInput;
  expected: TExpected | undefined;
  task: (input: TInput) => Evalite.MaybePromise<TExpected>;
  scores: Evalite.Scorer<TInput, TExpected>[];
}) => {
  const start = performance.now();
  const result = await opts.task(opts.input);
  const duration = Math.round(performance.now() - start);

  const scores = await Promise.all(
    opts.scores.map(
      async (scorer) =>
        await scorer({
          input: opts.input,
          output: result,
          expected: opts.expected,
        })
    )
  );

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

    const traces: Evalite.StoredTrace[] = [];

    reportTraceLocalStorage.enterWith((trace) => traces.push(trace));

    const sourceCodeHash = inject("evaliteInputHash");

    const data = await opts.data();
    const start = performance.now();
    const results = await Promise.all(
      data.map(async ({ input, expected }): Promise<Evalite.Result> => {
        const { result, scores, duration } = await runTask({
          expected,
          input,
          scores: opts.scorers,
          task: opts.task,
        });

        return {
          input,
          result,
          scores,
          duration,
          expected,
        };
      })
    );
    task.meta.evalite = {
      results,
      duration: Math.round(performance.now() - start),
      sourceCodeHash,
      traces,
    };
  });
};

export const createScorer = <TInput, TExpected>(
  name: string,
  scorer: (
    input: Evalite.ScoreInput<TInput, TExpected>
  ) => Evalite.MaybePromise<number>
): Evalite.Scorer<TInput, TExpected> => {
  return async (input: Evalite.ScoreInput<TInput, TExpected>) => {
    const score = await scorer(input);

    if (typeof score !== "number") {
      throw new Error(`The scorer '${name}' must return a number.`);
    }
    return {
      name,
      score,
    };
  };
};
