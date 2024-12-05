import { getEvalResult } from "@evalite/core/sdk";
import {
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { SidebarCloseIcon } from "lucide-react";
import type React from "react";
import { useContext, useLayoutEffect, useRef, useState } from "react";
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
  const data = await getEvalResult({
    name: args.params.name!,
    resultIndex: args.params.index!,
  });

  return { data, name: args.params.name!, resultIndex: args.params.index! };
};

export default function Page() {
  const {
    data: { result, prevResult, filepath },
    name,
    resultIndex,
  } = useLoaderData<typeof clientLoader>();

  const serverState = useContext(TestServerStateContext);

  const isRunning =
    serverState.state.type === "running" &&
    serverState.state.filepaths.has(filepath);

  const [searchParams] = useSearchParams();

  const startTime = result.traces[0]?.start ?? 0;
  const endTime = result.traces[result.traces.length - 1]?.end ?? 0;
  const totalTraceDuration = endTime - startTime;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant="ghost" asChild>
            <Link to={`/eval/${name}`} preventScrollReset>
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
      <SidebarContent className="p-2 pb-8 flex flex-row h-full">
        <div className="w-44 pr-2 flex flex-col gap-5 flex-shrink-0">
          <Trace
            title="Eval"
            startPercent={0}
            endPercent={100}
            to={`/eval/${name}/trace/${resultIndex}`}
          />
          {result.traces.map((trace, traceIndex) => {
            const startTimeWithinTrace = trace.start - startTime;
            const endTimeWithinTrace = trace.end - startTime;

            const startPercent =
              (startTimeWithinTrace / totalTraceDuration) * 100;
            const endPercent = (endTimeWithinTrace / totalTraceDuration) * 100;
            return (
              <Trace
                title={`Trace ${traceIndex + 1}`}
                to={`/eval/${name}/trace/${resultIndex}?trace=${traceIndex}`}
                endPercent={endPercent}
                startPercent={startPercent}
              ></Trace>
            );
          })}
        </div>
        <div className="flex-grow border-l pl-4">
          {!searchParams.has("trace") && (
            <>
              <DisplayTraceData
                input={result.input}
                expected={result.expected}
                result={result.result}
              />
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
            </>
          )}
          {searchParams.get("trace") && (
            <>
              <DisplayTraceData
                input={result.traces[Number(searchParams.get("trace"))]?.input}
                expected={undefined}
                result={
                  result.traces[Number(searchParams.get("trace"))]?.output
                }
              />
            </>
          )}
        </div>
      </SidebarContent>
    </>
  );
}

const DisplayTraceData = (props: {
  input: unknown;
  expected: unknown | undefined;
  result: unknown;
}) => {
  return (
    <>
      <SidebarSection title="Input">
        <DisplayInput
          shouldTruncateText={false}
          input={props.input}
        ></DisplayInput>
      </SidebarSection>
      <Separator className="my-2" />
      {props.expected ? (
        <>
          <SidebarSection title="Expected">
            <DisplayInput
              shouldTruncateText={false}
              input={props.expected}
            ></DisplayInput>
          </SidebarSection>
          <Separator className="my-2" />
        </>
      ) : null}
      <SidebarSection title="Output">
        <DisplayInput
          shouldTruncateText={false}
          input={props.result}
        ></DisplayInput>
      </SidebarSection>
    </>
  );
};

const Trace = (props: {
  title: string;
  /**
   * Number between 0 and 100
   */
  startPercent: number;
  /*
   * Number between 0 and 100
   */
  endPercent: number;
  to: string;
}) => {
  const length = props.endPercent - props.startPercent;

  return (
    <Link to={props.to}>
      <span className="block text-sm mb-1">{props.title}</span>
      <div className="relative w-full">
        <div className="w-full rounded-full h-1 bg-gray-200"></div>
        <div
          className="absolute top-0 w-full rounded-full h-1 bg-gray-600"
          style={{
            left: `${props.startPercent}%`,
            width: `${length}%`,
          }}
        ></div>
      </div>
    </Link>
  );
};
