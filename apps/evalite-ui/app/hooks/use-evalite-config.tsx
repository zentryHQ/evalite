import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface EvaliteConfig {
      apiBaseUrl?: string;
      wsBaseUrl?: string;
      [key: string]: unknown;
}

interface EvaliteConfigContextType {
      config: EvaliteConfig | null;
}

const EvaliteConfigContext = createContext<EvaliteConfigContextType | undefined>(
      undefined
);

interface EvaliteConfigProviderProps {
      children: ReactNode;
      config: EvaliteConfig | null;
}

export function EvaliteConfigProvider({
      children,
      config,
}: EvaliteConfigProviderProps) {
      return (
            <EvaliteConfigContext.Provider value={{ config }}>
                  {children}
            </EvaliteConfigContext.Provider>
      );
}

export function useEvaliteConfig(): EvaliteConfigContextType {
      const context = useContext(EvaliteConfigContext);
      if (context === undefined) {
            throw new Error(
                  "useEvaliteConfig must be used within an EvaliteConfigProvider"
            );
      }
      return context;
}

// Helper hook to get config values with defaults
export function useEvaliteConfigValue<T>(
      key: keyof EvaliteConfig,
      defaultValue: T
): T {
      const { config } = useEvaliteConfig();
      return (config?.[key] as T) ?? defaultValue;
}
