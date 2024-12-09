import { getEvalByName } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import React, { useContext } from "react";
import { DisplayInput } from "~/components/display-input";
import { InnerPageLayout } from "~/components/page-layout";
import { getScoreState, Score } from "~/components/score";
import {
  Table,
  TableBody,
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
  const result = await getEvalByName(args.params.name!);

  return {
    ...result,
    name: args.params.name!,
  };
};

export default function Page() {
  const { name, evaluation, prevEvaluation, history } =
    useLoaderData<typeof clientLoader>();

  const firstResult = evaluation.results[0];

  const serverState = useContext(TestServerStateContext);

  const showExpectedColumn = evaluation.results.every(
    (result) => result.expected !== null
  );

  const isTraceRoute = location.pathname.includes("trace");

  return (
    <>
      <InnerPageLayout
        title={name}
        vscodeUrl={`vscode://file${evaluation.filepath}`}
        filepath={evaluation.filepath.split(/(\/|\\)/).slice(-1)[0]!}
      >
        {/* {history.length > 1 && <MyLineChart data={history} />} */}
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
                <NavLink
                  prefetch="intent"
                  to={`trace/${index}`}
                  preventScrollReset
                  className={({ isActive }) => {
                    return cn("block h-full p-4", isActive && "active");
                  }}
                >
                  {props.children}
                </NavLink>
              );
              return (
                <TableRow
                  key={JSON.stringify(result.input)}
                  className="has-[.active]:bg-gray-100"
                >
                  <td>
                    <DisplayInput
                      input={result.input}
                      shouldTruncateText
                      Wrapper={Wrapper}
                    />
                  </td>
                  <td>
                    <DisplayInput
                      input={result.output}
                      shouldTruncateText
                      Wrapper={Wrapper}
                    />
                  </td>
                  {showExpectedColumn && (
                    <td>
                      <DisplayInput
                        input={result.expected}
                        shouldTruncateText
                        Wrapper={Wrapper}
                      />
                    </td>
                  )}
                  {result.scores.map((scorer, index) => {
                    const scoreInPreviousEvaluation = prevEvaluation?.results
                      .find((r) => r.input === result.input)
                      ?.scores.find((s) => s.name === scorer.name);
                    return (
                      <td
                        key={scorer.name}
                        className={cn(index === 0 && "border-l")}
                      >
                        <Wrapper>
                          <Score
                            score={scorer.score}
                            isRunning={
                              serverState.state.type === "running" &&
                              serverState.state.filepaths.has(
                                evaluation.filepath
                              )
                            }
                            state={getScoreState(
                              scorer.score,
                              scoreInPreviousEvaluation?.score
                            )}
                          />
                        </Wrapper>
                      </td>
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
          "fixed top-0 z-20 h-svh border-l p-2 bg-sidebar overflow-auto",
          "transition-[right] ease-linear shadow-lg duration-300",
          "hidden w-full sm:block sm:right-[-100%] sm:w-[500px] md:w-[600px] lg:w-[800px]",
          isTraceRoute && "block sm:right-0",
          !isTraceRoute && ""
        )}
      >
        <Outlet />
      </div>
    </>
  );
}
