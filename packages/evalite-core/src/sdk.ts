import type { Db } from "./db.js";

const BASE_URL = "http://localhost:3006";

export type GetMenuItemsResult = {
  evals: {
    filepath: string;
    score: number;
    name: string;
    prevScore: number | undefined;
  }[];
};

export const getMenuItems = async (): Promise<GetMenuItemsResult> => {
  const res = await fetch(`${BASE_URL}/api/menu-items`);
  return res.json() as any;
};

export const getEvalRunsByName = async (
  name: string
): Promise<JsonDBEval[]> => {
  const res = await fetch(`${BASE_URL}/api/eval?name=${name}`);
  return res.json() as any;
};

export const getEvalRun = async (opts: {
  name: string;
  timestamp: string;
}): Promise<JsonDbResult> => {
  const res = await fetch(
    `${BASE_URL}/api/eval/run?name=${opts.name}&timestamp=${opts.timestamp}`
  );
  return res.json() as any;
};

export const getEvalResult = async (opts: {
  name: string;
  resultIndex: string;
}): Promise<{
  filepath: string;
  result: JsonDbResult;
  prevResult: JsonDbResult | undefined;
}> => {
  const res = await fetch(
    `${BASE_URL}/api/eval/result?name=${opts.name}&index=${opts.resultIndex}`
  );
  return res.json() as any;
};
