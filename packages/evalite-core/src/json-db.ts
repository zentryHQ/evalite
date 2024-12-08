import type { SQLiteDatabase } from "./db.js";
import type { Evalite } from "./types.js";

export type JsonDBEvent =
  | {
      type: "PARTIAL_RUN_BEGIN";
      startTime: string;
    }
  | {
      type: "FULL_RUN_BEGIN";
      startTime: string;
    };

export type JsonDBLine = JsonDBEval | JsonDBEvent;

export type JsonDBEval = {
  filepath: string;
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
  traces: Evalite.Trace[];
};

export type GetJsonDbEvalsResult = Record<string, JsonDBEval[]>;

export const getLastTwoFullRuns = async (opts: {
  db: SQLiteDatabase;
}): Promise<GetJsonDbEvalsResult> => {
  throw new Error("Not implemented");
};
