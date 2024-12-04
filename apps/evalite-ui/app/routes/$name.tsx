import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { InnerPageLayout } from "~/components/page-header";

export const meta: MetaFunction<typeof clientLoader> = (args) => {
  return [
    { title: `${(args.data as any)?.name} | Evalite` },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return {
    name: args.params.name!,
  };
};

export default function Page() {
  const { name } = useLoaderData<typeof clientLoader>();

  return <InnerPageLayout title={name}>Hey</InnerPageLayout>;
}
