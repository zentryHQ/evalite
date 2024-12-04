import { getEvals } from "@evalite/core/sdk";
import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useSubscribeToTestServer } from "~/use-subscribe-to-socket";
import { scoreToPercent } from "~/utils";
import { Zap } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = async () => {
  const evals = await getEvals();

  console.log(evals);

  return {
    menu: Object.entries(evals).map(([key, value]) => {
      const mostRecentEval = value[0]!;

      const secondMostRecentEval = value[1];

      const score = mostRecentEval.score;

      const state = !secondMostRecentEval
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

export default function Index() {
  const evals = useLoaderData<typeof clientLoader>();

  const server = useSubscribeToTestServer();

  return (
    <div className="">
      <nav className="flex items-center p-4 px-6 space-x-12">
        <h1 className="text-xl flex items-center space-x-3 tracking-tight font-semibold">
          <Zap />
          <span>Evalite</span>
        </h1>
        <span className="bg-gray-800 uppercase px-4 py-1 rounded text-xs text-gray-200">
          {server.state === "idle" ? "idle" : "running"}
        </span>
      </nav>
      <main className="px-6">
        <div>
          <ul className="space-y-4">
            {evals.menu.map((menuItem) => (
              <li key={menuItem.name}>
                <Link to={`/${menuItem.name}`}>
                  <div className="flex items-center justify-between">
                    <span>{menuItem.name}</span>
                    <span
                      className={`${
                        menuItem.state === "up"
                          ? "text-green-500"
                          : menuItem.state === "down"
                            ? "text-red-500"
                            : ""
                      }`}
                    >
                      {scoreToPercent(menuItem.score)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
