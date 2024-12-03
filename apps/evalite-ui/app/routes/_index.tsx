import { getEvals } from "@evalite/core/sdk";
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

export const clientLoader = () => {
  return getEvals();
};

export default function Index() {
  const files = useLoaderData<typeof clientLoader>();

  const server = useSubscribeToTestServer();

  return (
    <div className="">
      <nav className="flex items-center p-6 space-x-6">
        <h1 className="text-xl">Evalite</h1>
        <span className="bg-gray-800 uppercase px-4 py-2 rounded text-xs">
          {server.state === "idle" ? "idle" : "running"}
        </span>
      </nav>
    </div>
  );
}
