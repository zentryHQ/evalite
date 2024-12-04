import { getEvals } from "@evalite/core/sdk";
import { redirect, type MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Evalite" }];
};

export const clientLoader = async () => {
  const evals = await getEvals();

  const firstName = Object.keys(evals)[0];

  if (firstName) {
    return redirect(`/${firstName}`);
  }

  return null;
};

export default function Page() {
  return null;
}
