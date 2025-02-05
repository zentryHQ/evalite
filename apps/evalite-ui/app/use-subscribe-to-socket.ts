import type { Evalite } from "@evalite/core";
import { useNavigate } from "@tanstack/react-router";
import { createContext, useEffect, useMemo, useState } from "react";

export const TestServerStateContext = createContext<
  ReturnType<typeof useSubscribeToTestServer>
>({} as never);

export const useSubscribeToTestServer = (serverState: Evalite.ServerState) => {
  const [state, setState] = useState<Evalite.ServerState>(serverState);

  const navigate = useNavigate();

  useEffect(() => {
    // Reload fetchers when the server state changes
    navigate({
      replace: true,
      resetScroll: false,
    });
  }, [state, navigate]);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${3006}/api/socket`);

    socket.onmessage = (event) => {
      const newState: Evalite.ServerState = JSON.parse(event.data);
      setState(newState);
    };

    return () => {
      socket.close();
    };
  }, []);

  return useMemo(() => {
    const filePathSet: Set<string> =
      state.type === "running" ? new Set(state.filepaths) : new Set();

    const isRunningFilepath = (filepath: string) =>
      filePathSet.has(filepath) && state.type === "running";

    const isRunningEvalName = (name: string) =>
      state.type === "running" && state.evalNamesRunning.includes(name);

    const isRunningResultId = (resultId: number | bigint) => {
      return (
        state.type === "running" && state.resultIdsRunning.includes(resultId)
      );
    };
    return {
      state,
      isRunningFilepath,
      isRunningEvalName,
    };
  }, [state]);
};
