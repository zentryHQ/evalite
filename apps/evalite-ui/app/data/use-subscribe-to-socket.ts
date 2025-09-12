import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { getServerStateQueryOptions } from "./queries";
import type { Evalite } from "evalite/types";
import { DEFAULT_SERVER_PORT } from "evalite/constants";
import { useEvaliteConfigValue } from "../hooks/use-evalite-config";

export const useSubscribeToSocket = (queryClient: QueryClient) => {
	// Get WebSocket URL from config or use default
	const wsBaseUrl = useEvaliteConfigValue(
		"wsBaseUrl",
		`ws://localhost:${DEFAULT_SERVER_PORT}`,
	);

	useEffect(() => {
		const socket = new WebSocket(`${wsBaseUrl}/api/socket`);

		socket.onmessage = async (event) => {
			const newState: Evalite.ServerState = JSON.parse(event.data);
			await queryClient.invalidateQueries();
			await queryClient.setQueryData(
				getServerStateQueryOptions.queryKey,
				newState,
			);
		};

		return () => {
			socket.close();
		};
	}, [queryClient, wsBaseUrl]);
};
