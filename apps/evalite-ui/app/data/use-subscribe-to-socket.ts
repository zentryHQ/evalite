import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { Evalite } from "@evalite/core";
import { getServerStateQueryOptions } from "./queries";

export const useSubscribeToSocket = (queryClient: QueryClient) => {
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${3006}/api/socket`);

    socket.onmessage = async (event) => {
      const newState: Evalite.ServerState = JSON.parse(event.data);
      await queryClient.invalidateQueries();
      await queryClient.setQueryData(
        getServerStateQueryOptions.queryKey,
        newState
      );
    };

    return () => {
      socket.close();
    };
  }, [queryClient]);
};
