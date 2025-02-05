import type { Evalite } from "@evalite/core";
import { getResult } from "@evalite/core/sdk";
import { sum } from "@evalite/core/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type React from "react";

import { z } from "zod";

const MainBodySection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="text-sm">
    <div className="mb-3">
      <h2 className="font-medium text-base text-gray-600">{title}</h2>
      {description && (
        <p className="text-gray-500 text-xs mt-1">{description}</p>
      )}
    </div>
    <div className="mt-1 text-gray-600">{children}</div>
  </div>
);

const searchSchema = z.object({
  trace: z.number().optional(),
});

export const Route = createFileRoute("/eval/$name/result/$resultIndex")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({
    timestamp: search.timestamp,
  }),
  loader: async ({ params, deps }) => {
    const data = await getResult({
      evalName: params.name!,
      resultIndex: params.resultIndex!,
      evalTimestamp: deps.timestamp ?? null,
    });

    return data;
  },
});
