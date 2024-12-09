import {
  ChevronDownCircleIcon,
  ChevronRightCircleIcon,
  ChevronUpCircleIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

export type ScoreState = "up" | "down" | "same" | "first";

export const Score = (props: {
  score: number;
  state: ScoreState;
  isRunning: boolean;
  iconClassName?: string;
}) => {
  return (
    <span className="flex items-center space-x-2">
      <span>{Math.round(props.score * 100)}%</span>
      {props.isRunning ? (
        <span className="text-gray-500">
          <LoaderCircleIcon
            className={cn(
              "size-3 text-blue-500 animate-spin",
              props.iconClassName
            )}
          />
        </span>
      ) : (
        <>
          {props.state === "up" && (
            <ChevronUpCircleIcon
              className={cn("size-3 text-green-600", props.iconClassName)}
            />
          )}
          {props.state === "down" && (
            <ChevronDownCircleIcon
              className={cn("size-3 text-red-600", props.iconClassName)}
            />
          )}
          {props.state === "same" && (
            <ChevronRightCircleIcon
              className={cn("size-3 text-blue-500", props.iconClassName)}
            />
          )}
          {props.state === "first" && (
            <ChevronRightCircleIcon
              className={cn("size-3 text-blue-500", props.iconClassName)}
            />
          )}
        </>
      )}
    </span>
  );
};

export const getScoreState = (
  score: number,
  prevScore: number | null | undefined
) => {
  const state: ScoreState =
    typeof prevScore === "undefined" || prevScore === null
      ? "first"
      : score > prevScore
        ? "up"
        : score < prevScore
          ? "down"
          : "same";

  return state;
};
