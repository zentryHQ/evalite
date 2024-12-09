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
import { getScoreState, Score, type ScoreState } from "./components/score";
import { cn } from "./lib/utils";
import "./tailwind.css";
import {
  TestServerStateContext,
  useSubscribeToTestServer,
} from "./use-subscribe-to-socket";
import { useContext } from "react";

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
  const { archivedEvals, currentEvals, prevScore, score } =
    await getMenuItems();

  return {
    prevScore,
    score,
    archivedEvals: archivedEvals.map((e) => {
      const state = getScoreState(e.score, e.prevScore);
      return {
        ...e,
        state,
      };
    }),
    currentEvals: currentEvals.map((e) => {
      const state = getScoreState(e.score, e.prevScore);
      return {
        ...e,
        state,
      };
    }),
  };
};

export default function App() {
  const data = useLoaderData<typeof clientLoader>();

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
              <div className="px-2">
                <p className="text-xs font-medium text-sidebar-foreground/70 mb-2">
                  Summary
                </p>
                <div className="text-gray-600 font-medium text-2xl">
                  <Score
                    isRunning={testServer.state.type === "running"}
                    score={data.score}
                    state={getScoreState(data.score, data.prevScore)}
                  />
                </div>
              </div>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Current Run</SidebarGroupLabel>
              <SidebarMenu>
                {data.currentEvals.map((e) => {
                  return (
                    <SidebarItem
                      key={`current-${e.name}`}
                      filepath={e.filepath}
                      name={e.name}
                      score={e.score}
                      state={e.state}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
            {data.archivedEvals.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Previous Runs</SidebarGroupLabel>
                <SidebarMenu>
                  {data.archivedEvals.map((e) => {
                    return (
                      <SidebarItem
                        key={`archived-${e.name}`}
                        filepath={e.filepath}
                        name={e.name}
                        score={e.score}
                        state={e.state}
                      />
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>
        <Outlet />
      </SidebarProvider>
    </TestServerStateContext.Provider>
  );
}

const SidebarItem = (props: {
  filepath: string;
  name: string;
  state: ScoreState;
  score: number;
}) => {
  let isRunning = false;

  const testServer = useContext(TestServerStateContext);

  if (testServer.state.type === "running") {
    isRunning = testServer.state.filepaths.has(props.filepath);
  }
  return (
    <SidebarMenuItem key={props.name}>
      <NavLink
        prefetch="intent"
        to={`/eval/${props.name}`}
        className={({ isActive }) =>
          cn(
            "flex justify-between text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors",
            isActive && "bg-gray-200 text-gray-800 hover:bg-gray-200"
          )
        }
      >
        <span>{props.name}</span>

        <Score score={props.score} state={props.state} isRunning={isRunning} />
      </NavLink>
    </SidebarMenuItem>
  );
};
