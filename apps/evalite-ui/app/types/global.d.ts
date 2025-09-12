import type { EvaliteConfig } from "../hooks/use-evalite-config";

declare global {
	const __EVALITE_CONFIG__: EvaliteConfig | null;
}

export {};
