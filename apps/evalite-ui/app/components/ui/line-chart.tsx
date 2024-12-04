"use client";

import { Area, AreaChart, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MyLineChart(props: { data: { score: number }[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-24 overflow-visible max-w-[120ch]"
    >
      <AreaChart accessibilityLayer data={props.data}>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
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
