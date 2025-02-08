import { queryOptions } from "@tanstack/react-query";
import {
  getMenuItems,
  getServerState,
  getResult,
  getEvalByName,
} from "@evalite/core/sdk";

export const getMenuItemsQueryOptions = queryOptions({
  queryKey: ["menu-items"] as const,
  queryFn: getMenuItems,
  staleTime: Infinity,
});

export const getServerStateQueryOptions = queryOptions({
  queryKey: ["server-state"] as const,
  queryFn: getServerState,
  staleTime: Infinity,
});

export const getEvalByNameQueryOptions = (
  name: string,
  timestamp: string | null | undefined
) =>
  queryOptions({
    queryKey: ["eval-by-name", name, timestamp] as const,
    queryFn: () => getEvalByName(name, timestamp),
    staleTime: Infinity,
  });

export const getResultQueryOptions = (opts: {
  evalName: string;
  evalTimestamp: string | null | undefined;
  resultIndex: string;
}) =>
  queryOptions({
    queryKey: ["result", opts] as const,
    queryFn: () => getResult(opts),
    staleTime: Infinity,
  });
