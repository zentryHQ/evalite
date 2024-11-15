import type { JsonDBTask, TasksMap } from "@evalite/core";
import { average } from "@evalite/core/utils";
import { DEFAULT_SERVER_PORT } from "@evalite/core/constants";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useSubscribeToTestServer } from "~/use-subscribe-to-socket";
import { scoreToPercent } from "~/utils";

export const loader = async (args: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(args.request.url.split("?")[1]);

  const path = searchParams.get("path");

  const task = searchParams.get("task");

  if (!path) {
    throw new Response("Missing path", { status: 400 });
  }

  if (!task) {
    throw new Response("Missing task", { status: 400 });
  }

  const data: JsonDBTask[] = await fetch(
    `http://localhost:${DEFAULT_SERVER_PORT}/api/task?path=${path}&task=${task}`
  ).then((res) => {
    if (!res.ok) {
      throw new Response("Task not found", { status: 404 });
    }

    return res.json();
  });

  if (!data) {
    throw new Response("Task not found", { status: 404 });
  }

  return {
    filename: path,
    task,
    results: data,
  };
};

export default function Page() {
  const { results, task } = useLoaderData<typeof loader>();

  useSubscribeToTestServer();

  const mostRecentRun = results[0];

  const secondMostRecentRun = results[1];

  return (
    <div className="p-6 space-y-6">
      <h1>{task}</h1>
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th className="text-left px-2">Input</th>
            <th className="text-left px-2">Expected</th>
            <th className="text-left px-2">Result</th>
            <th className="text-left px-2">Duration</th>
            <th className="text-left px-2"></th>
            <th className="text-left px-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {mostRecentRun.results
            .sort((a, b) => b.score - a.score)
            .map((result) => {
              const resultInSecondMostRecentRun =
                secondMostRecentRun.results.find(
                  (r) => r.input === result.input
                );
              return (
                <tr>
                  <td className="px-2">
                    <JsonInputRenderer input={result.input} />
                  </td>
                  <td className="px-2">
                    <JsonInputRenderer input={result.expected} />
                  </td>
                  <td className="px-2">
                    <JsonInputRenderer input={result.result} />
                  </td>
                  <td className="px-2">{result.duration}ms</td>
                  <td className="px-2">
                    {result.scores.map((score) => (
                      <div className="text-xs">
                        <span className="font-mono">{score.name}:</span>{" "}
                        {scoreToPercent(score.score)}
                      </div>
                    ))}
                  </td>
                  <td className="px-2">
                    {scoreToPercent(result.score)}
                    {resultInSecondMostRecentRun && (
                      <span className="text-xs">
                        {result.score > resultInSecondMostRecentRun.score
                          ? "🔼"
                          : result.score === resultInSecondMostRecentRun.score
                            ? ""
                            : "🔽"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export const JsonInputRenderer = (props: { input: unknown }) => {
  if (typeof props.input === "string") {
    return <p>{props.input}</p>;
  }
  if (typeof props.input === "number") {
    return <span>{props.input}</span>;
  }
  return <pre>{JSON.stringify(props.input)}</pre>;
};
