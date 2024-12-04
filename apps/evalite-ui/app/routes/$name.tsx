import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { InnerPageLayout } from "~/components/page-header";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type ScoreState = "up" | "down" | "same" | "first";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return {
    name: args.params.name!,
  };
};

export default function Page() {
  const { name } = useLoaderData<typeof clientLoader>();

  return <InnerPageLayout title={name}>Hey</InnerPageLayout>;
}
