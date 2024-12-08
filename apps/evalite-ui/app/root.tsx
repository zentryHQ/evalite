import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ZapIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar";

import { getMenuItems } from "@evalite/core/sdk";
import { getScoreState, Score } from "./components/score";
import { cn } from "./lib/utils";
import "./tailwind.css";
import {
  TestServerStateContext,
  useSubscribeToTestServer,
} from "./use-subscribe-to-socket";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const clientLoader = async () => {
  const { evals } = await getMenuItems();

  return {
    menu: evals.map((e) => {
      const state = getScoreState(e.score, e.prevScore);
      return {
        ...e,
        state,
      };
    }),
  };
};

export default function App() {
  const evals = useLoaderData<typeof clientLoader>();

  const testServer = useSubscribeToTestServer();

  return (
    <TestServerStateContext.Provider value={testServer}>
      <SidebarProvider>
        <Sidebar className="border-r-0">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-2 py-1 flex items-center space-x-2.5">
                  <ZapIcon className="size-4" />
                  <span className="truncate font-semibold tracking-tight">
                    Evalite
                  </span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Evals</SidebarGroupLabel>
              <SidebarMenu>
                {evals.menu.map((item) => {
                  let isRunning = false;

                  if (testServer.state.type === "running") {
                    isRunning = testServer.state.filepaths.has(item.filepath);
                  }
                  return (
                    <SidebarMenuItem key={item.name}>
                      <NavLink
                        to={`/eval/${item.name}`}
                        className={({ isActive }) =>
                          cn(
                            "flex justify-between text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors",
                            isActive &&
                              "bg-gray-200 text-gray-800 hover:bg-gray-200"
                          )
                        }
                      >
                        <span>{item.name}</span>

                        <Score
                          score={item.score}
                          state={item.state}
                          isRunning={isRunning}
                        />
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <Outlet />
      </SidebarProvider>
    </TestServerStateContext.Provider>
  );
}
