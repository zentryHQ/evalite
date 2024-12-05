export * from "./constants.js";

export declare namespace Evalite {
  export type WebsocketEvent =
    | {
        type: "RUN_IN_PROGRESS";
        filepaths: string[];
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
    traces: StoredTrace[];
  };

  export type Score = {
    /**
     * A number between 0 and 1.
     *
     * Added null for compatibility with {@link https://github.com/braintrustdata/autoevals | autoevals}.
     * null scores will be reported as 0.
     */
    score: number | null;
    name: string;
  };

  export type ScoreInput<TInput, TExpected> = {
    input: TInput;
    output: TExpected;
    expected?: TExpected;
  };

  export type TaskMeta = {
    results: Result[];
    duration: number | undefined;
    sourceCodeHash: string;
  };

  export type Scorer<TInput, TExpected> = (
    opts: ScoreInput<TInput, TExpected>
  ) => MaybePromise<Score>;

  export type RunnerOpts<TInput, TExpected> = {
    data: () => MaybePromise<{ input: TInput; expected?: TExpected }[]>;
    task: (input: TInput) => MaybePromise<TExpected>;
    scorers: Scorer<TInput, TExpected>[];
  };

  export interface UserProvidedTrace {
    input: unknown;
    usage?: {
      promptTokens: number;
      completionTokens: number;
    };
    output: unknown;
    start: number;
    end: number;
  }

  export interface StoredTrace extends UserProvidedTrace {
    duration: number;
  }

  export type TracePrompt = {
    role: string;
    content: TracePromptTextContent[] | string;
  };

  export type TracePromptTextContent = {
    type: "text";
    text: string;
  };
}

export * from "./json-db.js";
