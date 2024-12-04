import { getEvalRunsByName } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { useContext } from "react";
import { DisplayInput } from "~/components/display-input";
import { InnerPageLayout } from "~/components/page-header";
import { getScoreState, Score } from "~/components/score";
import { MyLineChart } from "~/components/ui/line-chart";
import {
  Table,
  TableBody,
  TableCaption,
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

  return (
    <InnerPageLayout title={name}>
      <MyLineChart data={history} />
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
          {evaluation.results.map((result) => {
            return (
              <TableRow key={result.input as any}>
                <TableCell>
                  <DisplayInput input={result.input} />
                </TableCell>
                <TableCell>
                  <DisplayInput input={result.result} />
                </TableCell>
                {showExpectedColumn && (
                  <TableCell>
                    <DisplayInput input={result.expected} />
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
                      <Score
                        score={scorer.score ?? 0}
                        isRunning={
                          serverState.state.type === "running" &&
                          serverState.state.filepaths.has(evaluation.filepath)
                        }
                        state={getScoreState(
                          scorer.score ?? 0,
                          scoreInPreviousEvaluation?.score
                        )}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </InnerPageLayout>
  );
}
