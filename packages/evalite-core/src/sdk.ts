import type { Db } from "./db.js";
import type { Evalite } from "./types.js";

const BASE_URL = "http://localhost:3006";

export const getServerState = async (): Promise<Evalite.ServerState> => {
  const res = await fetch(`${BASE_URL}/api/server-state`);
  return res.json() as any;
};

export type GetMenuItemsResultEval = {
  filepath: string;
  score: number;
  name: string;
  prevScore: number | undefined;
  evalStatus: Db.EvalStatus;
};

export type GetMenuItemsResult = {
  evals: GetMenuItemsResultEval[];
  score: number;
  prevScore: number | undefined;
  evalStatus: Db.EvalStatus;
};

export const getMenuItems = async (): Promise<GetMenuItemsResult> => {
  const res = await fetch(`${BASE_URL}/api/menu-items`);
  return res.json() as any;
};

export type GetEvalByNameResult = {
  history: {
    score: number;
    date: string;
  }[];
  evaluation: Db.Eval & { results: (Db.Result & { scores: Db.Score[] })[] };
  prevEvaluation:
    | (Db.Eval & { results: (Db.Result & { scores: Db.Score[] })[] })
    | undefined;
};

export const getEvalByName = async (
  name: string,
  timestamp: string | null | undefined
): Promise<GetEvalByNameResult> => {
  const params = new URLSearchParams({ name, timestamp: timestamp || "" });
  const res = await fetch(`${BASE_URL}/api/eval?${params.toString()}`);
  return res.json() as any;
};

export type GetResultResult = {
  result: Db.Result & { traces: Db.Trace[]; score: number; scores: Db.Score[] };
  prevResult: (Db.Result & { score: number; scores: Db.Score[] }) | undefined;
  evaluation: Db.Eval;
};

export const getResult = async (opts: {
  evalName: string;
  evalTimestamp: string | null | undefined;
  resultIndex: string;
}): Promise<GetResultResult> => {
  const params = new URLSearchParams({
    name: opts.evalName,
    index: opts.resultIndex,
    timestamp: opts.evalTimestamp || "",
  });
  const res = await fetch(`${BASE_URL}/api/eval/result?${params.toString()}`);
  return res.json() as any;
};

export const serveFile = (filepath: string) => {
  return `${BASE_URL}/api/file?path=${filepath}`;
};
