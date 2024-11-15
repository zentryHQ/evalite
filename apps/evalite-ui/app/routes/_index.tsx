import type { GetJsonDbFilesResult } from "@evalite/core";
import { DEFAULT_SERVER_PORT } from "@evalite/core/constants";
import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useSubscribeToTestServer } from "~/use-subscribe-to-socket";
import { scoreToPercent } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = (): Promise<GetJsonDbFilesResult> => {
  return fetch(`http://localhost:${DEFAULT_SERVER_PORT}/api/files`).then(
    (res) => res.json()
  );
};

export default function Index() {
  const files: GetJsonDbFilesResult = useLoaderData();

  const server = useSubscribeToTestServer();

  return (
    <div className="space-y-6 p-6">
      <div>
        <span>State: {server.state === "idle" ? "Idle" : "Running"}</span>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th className="min-w-32 text-left px-3">File</th>
              <th className="min-w-32 text-left px-3">Evals</th>
              <th className="min-w-32 text-left px-3">Datetime</th>
              <th className="min-w-32 text-left px-3">Duration</th>
              <th className="min-w-32 text-left px-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(files).map(([filename, runs]) => {
              const mostRecentRun = runs[0];
              return (
                <tr>
                  <td className="px-3">
                    <Link to={`/file?path=${filename}`}>{filename}</Link>
                  </td>
                  <td className="px-3">{mostRecentRun.tasks.length}</td>
                  <td className="px-3">
                    {new Date(mostRecentRun.datetime).toLocaleString()}
                  </td>
                  <td className="px-3">{mostRecentRun.duration}ms</td>
                  <td className="px-3">
                    {scoreToPercent(mostRecentRun.score)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
