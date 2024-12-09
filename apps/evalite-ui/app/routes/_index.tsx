import { getMenuItems } from "@evalite/core/sdk";
import { redirect, type MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Evalite" }];
};

export const clientLoader = async () => {
  const { currentEvals } = await getMenuItems();

  const firstName = currentEvals[0]?.name;

  if (firstName) {
    return redirect(`/eval/${firstName}`);
  }

  return null;
};

export default function Page() {
  return null;
}
