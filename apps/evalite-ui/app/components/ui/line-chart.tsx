"use client";

import { formatDistance } from "date-fns";
import { Area, AreaChart, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { LiveDate } from "./live-date";

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MyLineChart(props: {
  data: { date: string; score: number }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-24 overflow-visible max-w-[120ch] -mb-6 w-full"
    >
      <AreaChart
        accessibilityLayer
        data={props.data.map((s) => ({
          ...s,
          score: Math.round(s.score * 100),
        }))}
      >
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(l, p) => <LiveDate date={p[0]?.payload?.date} />}
            />
          }
        />
        <Area
          isAnimationActive={false}
          dataKey="score"
          type="linear"
          className="--var"
          strokeWidth={1}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
