import type { TasksMap } from "@evalite/core";
import { DEFAULT_SERVER_PORT } from "@evalite/core/constants";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useSubscribeToTestServer } from "~/use-subscribe-to-socket";
import { scoreToPercent } from "~/utils";

export const loader = async (args: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(args.request.url.split("?")[1]);

  const path = searchParams.get("path");

  if (!path) {
    throw new Response("Missing path", { status: 400 });
  }

  const data: TasksMap = await fetch(
    `http://localhost:${DEFAULT_SERVER_PORT}/api/file?path=${path}`
  ).then((res) => {
    if (!res.ok) {
      throw new Response("File not found", { status: 404 });
    }

    return res.json();
  });

  if (!data) {
    throw new Response("File not found", { status: 404 });
  }

  return {
    filename: path,
    results: data,
  };
};

export default function Page() {
  const { results, filename } = useLoaderData<typeof loader>();

  useSubscribeToTestServer();

  return (
    <div className="p-6 space-y-6">
      <h1>{filename}</h1>
      <h2>Tasks</h2>
      <table>
        <thead>
          <tr>
            <th className="text-left px-2">Task</th>
            <th className="text-left px-2">Datasets</th>
            <th className="text-left px-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).map(([taskName, results]) => {
            const first = results[0];
            return (
              <tr>
                <td className="px-2">
                  <Link to={`/task?path=${filename}&task=${taskName}`}>
                    {taskName}
                  </Link>
                </td>
                <td className="px-2">{first.results.length}</td>
                <td className="px-2">{scoreToPercent(first.score)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
