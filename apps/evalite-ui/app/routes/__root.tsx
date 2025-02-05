import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

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

import { getMenuItems, getServerState } from "@evalite/core/sdk";
import { getScoreState, Score, type ScoreState } from "~/components/score";
import "../tailwind.css";
import {
  TestServerStateContext,
  useSubscribeToTestServer,
} from "../use-subscribe-to-socket";
import { useContext } from "react";
import Logo from "~/components/logo";
import type { Db } from "@evalite/core/db";

export const Route = createRootRoute({
  component: App,
  loader: async () => {
    const [{ evals: currentEvals, prevScore, score, evalStatus }, serverState] =
      await Promise.all([getMenuItems(), getServerState()]);

    return {
      serverState,
      evalStatus,
      prevScore,
      score,
      currentEvals: currentEvals.map((e) => {
        const state = getScoreState(e.score, e.prevScore);
        return {
          ...e,
          state,
        };
      }),
    };
  },
});

export default function App() {
  const data = Route.useLoaderData();

  const testServer = useSubscribeToTestServer(data.serverState);

  return (
    <TestServerStateContext.Provider value={testServer}>
      <SidebarProvider>
        <Sidebar className="border-r-0">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem className="border-b md:-mx-3 -mx-2 md:px-3 px-2 pb-1.5">
                <div className="px-2 py-1">
                  <Logo />
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
                    iconClassName="size-4"
                    evalStatus={data.evalStatus}
                    resultStatus={undefined}
                  />
                </div>
              </div>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Evals</SidebarGroupLabel>
              <SidebarMenu>
                {data.currentEvals.map((e) => {
                  return (
                    <EvalSidebarItem
                      key={`current-${e.name}`}
                      name={e.name}
                      score={e.score}
                      state={e.state}
                      evalStatus={e.evalStatus}
                    />
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

const EvalSidebarItem = (props: {
  name: string;
  state: ScoreState;
  score: number;
  evalStatus: Db.EvalStatus;
}) => {
  const testServer = useContext(TestServerStateContext);

  return (
    <SidebarMenuItem key={props.name}>
      <Link
        preload="intent"
        to={`/eval/$name`}
        params={{ name: props.name }}
        className={
          "flex justify-between text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        }
        activeProps={{
          className: "bg-gray-200 text-gray-800 hover:bg-gray-200",
        }}
      >
        <span>{props.name}</span>

        <Score
          score={props.score}
          state={props.state}
          isRunning={testServer.isRunningEvalName(props.name)}
          evalStatus={props.evalStatus}
          resultStatus={undefined}
        />
      </Link>
    </SidebarMenuItem>
  );
};
