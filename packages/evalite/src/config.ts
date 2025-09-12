import path from "path";
import { existsSync } from "fs";
import { pathToFileURL } from "url";
import type { EvaliteConfig } from "./types.js";

// Function to load evalite.config.ts from the current working directory

export async function loadEvaliteConfig(): Promise<EvaliteConfig | undefined> {
	const configPath = path.resolve(process.cwd(), "evalite.config.ts");

	if (!existsSync(configPath)) {
		return undefined;
	}

	try {
		// Convert file path to file URL for dynamic import
		const configUrl = pathToFileURL(configPath).href;
		const configModule = await import(configUrl);

		// Handle both default export and named export
		const config = configModule.default || configModule;

		return config;
	} catch (error) {
		console.error("Failed to load evalite.config.ts:", error);
		return undefined;
	}
}
