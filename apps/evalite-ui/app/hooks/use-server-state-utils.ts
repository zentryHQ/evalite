import { useMemo } from "react";
import type { Evalite } from "@evalite/core";

export const useServerStateUtils = (state: Evalite.ServerState) => {
  return useMemo(() => {
    const filePathSet: Set<string> =
      state.type === "running" ? new Set(state.filepaths) : new Set();

    const isRunningFilepath = (filepath: string) =>
      filePathSet.has(filepath) && state.type === "running";

    const isRunningEvalName = (name: string) =>
      state.type === "running" && state.evalNamesRunning.includes(name);

    return {
      isRunningFilepath,
      isRunningEvalName,
    };
  }, [state]);
};
