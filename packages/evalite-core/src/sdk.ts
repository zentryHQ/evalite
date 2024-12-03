import type {
  GetJsonDbEvalsResult,
  JsonDBEval,
  JsonDbResult,
} from "./json-db.js";

const BASE_URL = "http://localhost:3006";

export const getEvals = async (): Promise<GetJsonDbEvalsResult> => {
  const res = await fetch(`${BASE_URL}/api/evals`);
  return res.json() as Promise<GetJsonDbEvalsResult>;
};

export const getEvalByName = async (name: string): Promise<JsonDBEval[]> => {
  const res = await fetch(`${BASE_URL}/api/eval?name=${name}`);
  return res.json() as Promise<JsonDBEval[]>;
};

export const getEvalRun = async (opts: {
  name: string;
  timestamp: string;
}): Promise<JsonDbResult> => {
  const res = await fetch(
    `${BASE_URL}/api/eval/run?name=${opts.name}&timestamp=${opts.timestamp}`
  );
  return res.json() as Promise<JsonDbResult>;
};
