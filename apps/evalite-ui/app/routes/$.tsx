import { getMenuItems } from "@evalite/core/sdk";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: IndexRoute,
  loader: async () => {
    const { evals: currentEvals } = await getMenuItems();

    const firstName = currentEvals[0]?.name;

    if (firstName) {
      return redirect({
        to: "/eval/$name",
        params: {
          name: firstName,
        },
      });
    }

    return null;
  },
});

function IndexRoute() {
  return <title>Evalite</title>;
}
