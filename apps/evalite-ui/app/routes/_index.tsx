import { getEvals } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  ChevronDownCircleIcon,
  ChevronUpCircleIcon,
  MinusCircleIcon,
  ZapIcon,
} from "lucide-react";
import { SidebarRight } from "~/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { useSubscribeToTestServer } from "~/use-subscribe-to-socket";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type ScoreState = "up" | "down" | "same" | "first";

export const clientLoader = async () => {
  const evals = await getEvals();

  return {
    menu: Object.entries(evals).map(([key, value]) => {
      const mostRecentEval = value[0]!;

      const secondMostRecentEval = value[1];

      const score = mostRecentEval.score;

      const state: ScoreState = !secondMostRecentEval
        ? "first"
        : score > secondMostRecentEval.score
          ? "up"
          : score < secondMostRecentEval.score
            ? "down"
            : "same";
      return {
        name: key,
        state,
        score,
      };
    }),
  };
};

export default function Index() {
  const evals = useLoaderData<typeof clientLoader>();

  return (
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
              {evals.menu.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link to={`/${item.name}`} className="flex justify-between">
                      <span>{item.name}</span>
                      <Score score={item.score} state={item.state} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}

const Score = (props: { score: number; state: ScoreState }) => {
  return (
    <span className="flex items-center space-x-2">
      <span>{Math.round(props.score * 100)}%</span>
      {props.state === "up" && (
        <span className="text-primary">
          <ChevronUpCircleIcon />
        </span>
      )}
      {props.state === "down" && (
        <span className="text-destructive">
          <ChevronDownCircleIcon className="" />
        </span>
      )}
      {props.state === "same" && (
        <span className="text-blue-500">
          <MinusCircleIcon className="transform size-3" />
        </span>
      )}
      {props.state === "first" && (
        <span className="text-muted">
          <MinusCircleIcon className="transform size-3" />
        </span>
      )}
    </span>
  );
};
