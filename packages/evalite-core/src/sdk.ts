import type { Db } from "./db.js";

const BASE_URL = "http://localhost:3006";

type GetMenuItemsResultEval = {
  filepath: string;
  score: number;
  name: string;
  prevScore: number | undefined;
};

export type GetMenuItemsResult = {
  currentEvals: GetMenuItemsResultEval[];
  archivedEvals: GetMenuItemsResultEval[];
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
  name: string
): Promise<GetEvalByNameResult> => {
  const res = await fetch(`${BASE_URL}/api/eval?name=${name}`);
  return res.json() as any;
};

export type GetResultResult = {
  result: Db.Result & { traces: Db.Trace[]; score: number; scores: Db.Score[] };
  prevResult: (Db.Result & { score: number; scores: Db.Score[] }) | undefined;
  filepath: string;
};

export const getResult = async (opts: {
  evalName: string;
  resultIndex: string;
}): Promise<GetResultResult> => {
  const res = await fetch(
    `${BASE_URL}/api/eval/result?name=${opts.evalName}&index=${opts.resultIndex}`
  );
  return res.json() as any;
};
