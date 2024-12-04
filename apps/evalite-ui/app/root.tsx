import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import {
  ChevronDownCircleIcon,
  ChevronUpCircleIcon,
  MinusCircleIcon,
  ZapIcon,
} from "lucide-react";
import { SidebarRight } from "~/components/sidebar-right";
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
} from "~/components/ui/sidebar";

import "./tailwind.css";
import { getEvals } from "@evalite/core/sdk";

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

export default function App() {
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
