import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

export const useSubscribeToTestServer = (queryClient: QueryClient) => {
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${3006}/api/socket`);

    socket.onmessage = (event) => {
      queryClient.invalidateQueries();
    };

    return () => {
      socket.close();
    };
  }, []);

  // return useMemo(() => {
  //   const filePathSet: Set<string> =
  //     state.type === "running" ? new Set(state.filepaths) : new Set();

  //   const isRunningFilepath = (filepath: string) =>
  //     filePathSet.has(filepath) && state.type === "running";

  //   const isRunningEvalName = (name: string) =>
  //     state.type === "running" && state.evalNamesRunning.includes(name);

  //   const isRunningResultId = (resultId: number | bigint) => {
  //     return (
  //       state.type === "running" && state.resultIdsRunning.includes(resultId)
  //     );
  //   };
  //   return {
  //     state,
  //     isRunningFilepath,
  //     isRunningEvalName,
  //   };
  // }, [state]);
};
