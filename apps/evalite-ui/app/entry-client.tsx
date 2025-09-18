import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  type EvaliteConfig,
  EvaliteConfigProvider,
} from "./hooks/use-evalite-config";
import { ThemeProvider } from "./hooks/use-theme";
import { routeTree } from "./routeTree.gen";

// Get the config from the global window object (injected by server)
const evaliteConfig: EvaliteConfig | null =
  (window as { __EVALITE_CONFIG__?: EvaliteConfig }).__EVALITE_CONFIG__ || null;

console.log("🔧 Client received config:", evaliteConfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  context: { queryClient },
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => {
    return (
      <div className="mt-12 flex h-full w-full flex-col items-center justify-center">
        <h1 className="mb-3 font-bold text-3xl text-gray-800">
          404: Eval Not Found
        </h1>
        <p className="max-w-xs text-center text-gray-600 text-lg">
          The page you're looking for has already achieved AGI.
        </p>
      </div>
    );
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface RouterContext {
    queryClient: QueryClient;
  }
}

// Hydrate the app
const rootElement = document.getElementById("root");
if (rootElement) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <EvaliteConfigProvider config={evaliteConfig}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </EvaliteConfigProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
