import { getEvalRunsByName } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { useContext } from "react";
import { InnerPageLayout } from "~/components/page-header";
import { getScoreState, Score } from "~/components/score";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TestServerStateContext } from "~/use-subscribe-to-socket";

export const meta: MetaFunction<typeof clientLoader> = (args) => {
  return [
    { title: `${(args.data as any)?.name} | Evalite` },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const evaluations = await getEvalRunsByName(args.params.name!);

  return {
    evaluation: evaluations[0]!,
    prevEvaluation: evaluations[1],
    name: args.params.name!,
  };
};

export default function Page() {
  const { name, evaluation, prevEvaluation } =
    useLoaderData<typeof clientLoader>();

  const firstResult = evaluation.results[0];

  const serverState = useContext(TestServerStateContext);

  return (
    <InnerPageLayout title={name}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Input</TableHead>
            <TableHead>Output</TableHead>
            <TableHead>Expected</TableHead>
            {firstResult?.scores.map((scorer) => (
              <TableHead key={scorer.name}>{scorer.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluation.results.map((result) => {
            return (
              <TableRow key={result.input as any}>
                <TableCell>{result.input as any}</TableCell>
                <TableCell>{result.result as any}</TableCell>
                <TableCell>{result.expected as any}</TableCell>
                {result.scores.map((scorer) => {
                  const scoreInPreviousEvaluation = prevEvaluation?.results
                    .find((r) => r.input === result.input)
                    ?.scores.find((s) => s.name === scorer.name);
                  return (
                    <TableCell key={scorer.name}>
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
