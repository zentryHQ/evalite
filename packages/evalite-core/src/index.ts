export * from "./constants.js";

export declare namespace Evalite {
  export type WebsocketEvent =
    | {
        type: "RUN_IN_PROGRESS";
      }
    | {
        type: "RUN_COMPLETE";
      };

  export type MaybePromise<T> = T | Promise<T>;

  export type Result = {
    input: unknown;
    result: unknown;
    expected: unknown | undefined;
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

  export type ScoreInput<TExpected> = {
    output: TExpected;
    expected?: TExpected;
  };

  export type TaskMeta = {
    results: Result[];
    duration: number | undefined;
  };

  export type Scorer<TExpected> = (
    opts: ScoreInput<TExpected>
  ) => MaybePromise<Score>;

  export type RunnerOpts<TInput, TExpected> = {
    data: () => MaybePromise<{ input: TInput; expected?: TExpected }[]>;
    task: (input: TInput) => MaybePromise<TExpected>;
    scorers: Scorer<TExpected>[];
  };
}

export * from "./json-db.js";
