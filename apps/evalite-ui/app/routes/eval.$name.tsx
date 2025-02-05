import { getEvalByName } from "@evalite/core/sdk";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  timestamp: z.string().optional(),
});

export const Route = createFileRoute("/eval/$name")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search: { timestamp } }) => ({
    timestamp,
  }),
  loader: async ({ params, deps }) => {
    const result = await getEvalByName(params.name, deps.timestamp);

    return result;
  },
});
