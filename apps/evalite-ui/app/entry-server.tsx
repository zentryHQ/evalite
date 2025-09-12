import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { EvaliteConfigProvider, type EvaliteConfig } from "./hooks/use-evalite-config";

export function render(_url: string, evaliteConfig: EvaliteConfig | null) {
      const queryClient = new QueryClient({
            defaultOptions: {
                  queries: {
                        staleTime: Infinity,
                  },
            },
      });

      const router = createRouter({
            routeTree,
            context: { queryClient },
      });

      const html = renderToString(
            <StrictMode>
                  <QueryClientProvider client={queryClient}>
                        <EvaliteConfigProvider config={evaliteConfig}>
                              <RouterProvider router={router} />
                        </EvaliteConfigProvider>
                  </QueryClientProvider>
            </StrictMode>
      );

      return html;
}