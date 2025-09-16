import { DEFAULT_SERVER_PORT } from "./constants.js";
import type { Db } from "./db.js";
import type { Evalite, EvaliteConfig } from "./types.js";

// Function to get the base URL from config or fallback to default
const getBaseUrl = (config?: EvaliteConfig): string => {
  if (config?.apiBaseUrl) {
    return config.apiBaseUrl;
  }
  const port = config?.port ?? DEFAULT_SERVER_PORT;
  return `http://localhost:${port}`;
};

/**
 * Common fetch function with error handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The JSON response
 * @throws Error if the response is not OK
 */
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export const getServerState = async (
  config?: EvaliteConfig,
  fetchOpts?: {
    signal?: AbortSignal;
  }
): Promise<Evalite.ServerState> => {
  const baseUrl = getBaseUrl(config);
  return safeFetch<Evalite.ServerState>(
    `${baseUrl}/api/server-state`,
    fetchOpts
  );
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

export const getMenuItems = async (
  config?: EvaliteConfig,
  fetchOpts?: {
    signal?: AbortSignal;
  }
): Promise<GetMenuItemsResult> => {
  const baseUrl = getBaseUrl(config);
  return safeFetch<GetMenuItemsResult>(`${baseUrl}/api/menu-items`, fetchOpts);
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
  timestamp: string | null | undefined,
  config?: EvaliteConfig,
  fetchOpts?: { signal?: AbortSignal }
): Promise<GetEvalByNameResult> => {
  const baseUrl = getBaseUrl(config);
  const params = new URLSearchParams({ name, timestamp: timestamp || "" });
  return safeFetch<GetEvalByNameResult>(
    `${baseUrl}/api/eval?${params.toString()}`,
    fetchOpts
  );
};

export type GetResultResult = {
  result: Db.Result & { traces: Db.Trace[]; score: number; scores: Db.Score[] };
  prevResult: (Db.Result & { score: number; scores: Db.Score[] }) | undefined;
  evaluation: Db.Eval;
};

export const getResult = async (
  opts: {
    evalName: string;
    evalTimestamp: string | null | undefined;
    resultIndex: string;
  },
  config?: EvaliteConfig,
  fetchOpts?: { signal?: AbortSignal }
): Promise<GetResultResult> => {
  const baseUrl = getBaseUrl(config);
  const params = new URLSearchParams({
    name: opts.evalName,
    index: opts.resultIndex,
    timestamp: opts.evalTimestamp || "",
  });
  return safeFetch<GetResultResult>(
    `${baseUrl}/api/eval/result?${params.toString()}`,
    fetchOpts
  );
};

export const serveFile = (filepath: string, config?: EvaliteConfig) => {
  const baseUrl = getBaseUrl(config);
  return `${baseUrl}/api/file?path=${filepath}`;
};

export const downloadFile = (filepath: string, config?: EvaliteConfig) => {
  const baseUrl = getBaseUrl(config);
  return `${baseUrl}/api/file?path=${filepath}&download=true`;
};
