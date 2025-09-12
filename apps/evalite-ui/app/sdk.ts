import { notFound } from "@tanstack/react-router";
import { DEFAULT_SERVER_PORT } from "evalite/constants";
import type { Evalite } from "evalite/types";

// Function to get the base URL from config or fallback to default
const getBaseUrl = (): string => {
	// Try to get config from window if available (client-side)
	if (typeof window !== "undefined" && (window as any).__EVALITE_CONFIG__) {
		const config = (window as any).__EVALITE_CONFIG__;
		return config.apiBaseUrl || `http://localhost:${DEFAULT_SERVER_PORT}`;
	}
	// Fallback to default
	return `http://localhost:${DEFAULT_SERVER_PORT}`;
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
		if (response.status === 404) {
			throw notFound();
		}

		throw new Error(
			`API request failed: ${response.status} ${response.statusText}`,
		);
	}

	return response.json() as Promise<T>;
}

export const getServerState = async (fetchOpts?: {
	signal?: AbortSignal;
}): Promise<Evalite.ServerState> => {
	const baseUrl = getBaseUrl();
	return safeFetch<Evalite.ServerState>(
		`${baseUrl}/api/server-state`,
		fetchOpts,
	);
};

export const getMenuItems = async (fetchOpts?: {
	signal?: AbortSignal;
}): Promise<Evalite.SDK.GetMenuItemsResult> => {
	const baseUrl = getBaseUrl();
	return safeFetch<Evalite.SDK.GetMenuItemsResult>(
		`${baseUrl}/api/menu-items`,
		fetchOpts,
	);
};

export const getEvalByName = async (
	name: string,
	timestamp: string | null | undefined,
	fetchOpts?: { signal?: AbortSignal },
): Promise<Evalite.SDK.GetEvalByNameResult> => {
	const baseUrl = getBaseUrl();
	const params = new URLSearchParams({ name, timestamp: timestamp || "" });
	return safeFetch<Evalite.SDK.GetEvalByNameResult>(
		`${baseUrl}/api/eval?${params.toString()}`,
		fetchOpts,
	);
};

export const getResult = async (
	opts: {
		evalName: string;
		evalTimestamp: string | null | undefined;
		resultIndex: string;
	},
	fetchOpts?: { signal?: AbortSignal },
): Promise<Evalite.SDK.GetResultResult> => {
	const baseUrl = getBaseUrl();
	const params = new URLSearchParams({
		name: opts.evalName,
		index: opts.resultIndex,
		timestamp: opts.evalTimestamp || "",
	});
	return safeFetch<Evalite.SDK.GetResultResult>(
		`${baseUrl}/api/eval/result?${params.toString()}`,
		fetchOpts,
	);
};

export const serveFile = (filepath: string) => {
	const baseUrl = getBaseUrl();
	return `${baseUrl}/api/file?path=${filepath}`;
};

export const downloadFile = (filepath: string) => {
	const baseUrl = getBaseUrl();
	return `${baseUrl}/api/file?path=${filepath}&download=true`;
};
