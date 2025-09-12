import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { EvaliteConfigProvider, type EvaliteConfig } from "./hooks/use-evalite-config";

// Get the config from the global window object (injected by server)
const evaliteConfig: EvaliteConfig | null = (window as { __EVALITE_CONFIG__?: EvaliteConfig }).__EVALITE_CONFIG__ || null;

console.log("🔧 Client received config:", evaliteConfig);

const queryClient = new QueryClient({
      defaultOptions: {
            queries: {
                  staleTime: Infinity,
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
                  <div className="flex flex-col h-full w-full items-center justify-center mt-12">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                              404: Eval Not Found
                        </h1>
                        <p className="text-lg text-gray-600 text-center max-w-xs">
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
                              <RouterProvider router={router} />
                        </EvaliteConfigProvider>
                  </QueryClientProvider>
            </StrictMode>
      );
}
