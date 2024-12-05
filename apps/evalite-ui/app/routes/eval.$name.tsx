import { getEvalRunsByName } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import React, { useContext } from "react";
import { DisplayInput } from "~/components/display-input";
import { InnerPageLayout } from "~/components/page-layout";
import { getScoreState, Score } from "~/components/score";
import { MyLineChart } from "~/components/ui/line-chart";
import { Sidebar } from "~/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { TestServerStateContext } from "~/use-subscribe-to-socket";

export const meta: MetaFunction<typeof clientLoader> = (args) => {
  return [
    { title: `${(args.data as any)?.name} | Evalite` },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const evaluations = await getEvalRunsByName(args.params.name!);

  const history = evaluations
    .map((e) => ({
      score: Math.round(e.score * 100),
      date: e.startTime,
    }))
    .reverse();

  return {
    evaluation: evaluations[0]!,
    prevEvaluation: evaluations[1],
    name: args.params.name!,
    history,
  };
};

export default function Page() {
  const { name, evaluation, prevEvaluation, history } =
    useLoaderData<typeof clientLoader>();

  const firstResult = evaluation.results[0];

  const serverState = useContext(TestServerStateContext);

  const showExpectedColumn = evaluation.results.every(
    (result) => result.expected !== undefined
  );

  const isTraceRoute = location.pathname.includes("trace");

  return (
    <>
      <InnerPageLayout
        title={name}
        vscodeUrl={`vscode://file${evaluation.filepath}`}
        filepath={evaluation.filepath.split(/(\/|\\)/).slice(-1)[0]!}
      >
        {history.length > 1 && <MyLineChart data={history} />}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Input</TableHead>
              <TableHead>Output</TableHead>
              {showExpectedColumn && <TableHead>Expected</TableHead>}
              {firstResult?.scores.map((scorer, index) => (
                <TableHead
                  key={scorer.name}
                  className={cn(index === 0 && "border-l")}
                >
                  {scorer.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluation.results.map((result, index) => {
              const Wrapper = (props: { children: React.ReactNode }) => (
                <Link to={`trace/${index}`} preventScrollReset>
                  {props.children}
                </Link>
              );
              return (
                <TableRow key={JSON.stringify(result.input)}>
                  <TableCell>
                    <DisplayInput
                      input={result.input}
                      shouldTruncateText
                      Wrapper={Wrapper}
                    />
                  </TableCell>
                  <TableCell>
                    <DisplayInput
                      input={result.result}
                      shouldTruncateText
                      Wrapper={Wrapper}
                    />
                  </TableCell>
                  {showExpectedColumn && (
                    <TableCell>
                      <DisplayInput
                        input={result.expected}
                        shouldTruncateText
                        Wrapper={Wrapper}
                      />
                    </TableCell>
                  )}
                  {result.scores.map((scorer, index) => {
                    const scoreInPreviousEvaluation = prevEvaluation?.results
                      .find((r) => r.input === result.input)
                      ?.scores.find((s) => s.name === scorer.name);
                    return (
                      <TableCell
                        key={scorer.name}
                        className={cn(index === 0 && "border-l")}
                      >
                        <Wrapper>
                          <Score
                            score={scorer.score ?? 0}
                            isRunning={
                              serverState.state.type === "running" &&
                              serverState.state.filepaths.has(
                                evaluation.filepath
                              )
                            }
                            state={getScoreState(
                              scorer.score ?? 0,
                              scoreInPreviousEvaluation?.score
                            )}
                          />
                        </Wrapper>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </InnerPageLayout>
      <div
        className={cn(
          "fixed top-0 h-svh w-[700px] border-l p-2 bg-sidebar overflow-auto",
          "transition-[left,right,width] ease-linear shadow-lg",
          isTraceRoute ? "right-0" : "right-[-700px]"
        )}
      >
        <Outlet />
      </div>
    </>
  );
}
