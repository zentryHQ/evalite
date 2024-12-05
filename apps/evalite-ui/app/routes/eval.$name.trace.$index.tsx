import { getEvalResult } from "@evalite/core/sdk";
import {
  Link,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { SidebarCloseIcon } from "lucide-react";
import type React from "react";
import { useContext } from "react";
import { DisplayInput } from "~/components/display-input";
import { getScoreState, Score } from "~/components/score";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { TestServerStateContext } from "~/use-subscribe-to-socket";

const SidebarSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="text-sm">
    <h2 className="font-semibold text-base mb-1">{title}</h2>
    {children}
  </div>
);

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const result = await getEvalResult({
    name: args.params.name!,
    resultIndex: args.params.index!,
  });

  return result;
};

export default function Page() {
  const { result, prevResult, filepath } = useLoaderData<typeof clientLoader>();

  const serverState = useContext(TestServerStateContext);

  const isRunning =
    serverState.state.type === "running" &&
    serverState.state.filepaths.has(filepath);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant="ghost" asChild>
            <Link to={"../../"} preventScrollReset>
              <SidebarCloseIcon className="size-5 rotate-180" />
            </Link>
          </Button>
          <div>
            <span className="text-primary block font-semibold mb-1">Trace</span>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Score
                    isRunning={isRunning}
                    score={result.score}
                    state={getScoreState(result.score, prevResult?.score)}
                  />
                </BreadcrumbItem>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <BreadcrumbItem>{result.duration}ms</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <Separator className="mt-2" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarSection title="Input">
          <DisplayInput
            shouldTruncateText={false}
            input={result.input}
          ></DisplayInput>
        </SidebarSection>
        <Separator className="my-2" />
        {result.expected ? (
          <>
            <SidebarSection title="Expected">
              <DisplayInput
                shouldTruncateText={false}
                input={result.expected}
              ></DisplayInput>
            </SidebarSection>
            <Separator className="my-2" />
          </>
        ) : null}
        <SidebarSection title="Output">
          <DisplayInput
            shouldTruncateText={false}
            input={result.result}
          ></DisplayInput>
        </SidebarSection>
        {result.scores.map((score) => (
          <>
            <Separator className="my-2" />
            <SidebarSection key={score.name} title={score.name}>
              <Score
                isRunning={isRunning}
                score={score.score ?? 0}
                state={getScoreState(
                  score.score ?? 0,
                  prevResult?.scores.find(
                    (prevScore) => prevScore.name === score.name
                  )?.score
                )}
              />
            </SidebarSection>
          </>
        ))}
      </SidebarContent>
    </>
  );
}
