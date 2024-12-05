import {
  ChevronDownCircleIcon,
  ChevronRightCircleIcon,
  ChevronUpCircleIcon,
  LoaderCircleIcon,
} from "lucide-react";

export type ScoreState = "up" | "down" | "same" | "first";

export const Score = (props: {
  score: number;
  state: ScoreState;
  isRunning: boolean;
}) => {
  return (
    <span className="flex items-center space-x-2">
      <span>{Math.round(props.score * 100)}%</span>
      {props.isRunning ? (
        <span className="text-gray-500">
          <LoaderCircleIcon className="size-3 animate-spin" />
        </span>
      ) : (
        <>
          {props.state === "up" && (
            <span className="text-primary">
              <ChevronUpCircleIcon className="size-3 text-green-600" />
            </span>
          )}
          {props.state === "down" && (
            <span className="text-destructive">
              <ChevronDownCircleIcon className="size-3 text-red-600" />
            </span>
          )}
          {props.state === "same" && (
            <span className="text-gray-600">
              <ChevronRightCircleIcon className="size-3" />
            </span>
          )}
          {props.state === "first" && (
            <span className="text-gray-600">
              <ChevronRightCircleIcon className="size-3" />
            </span>
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
