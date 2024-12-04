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
        <span className="text-blue-500">
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
            <span className="text-blue-600">
              <ChevronRightCircleIcon className="size-3" />
            </span>
          )}
          {props.state === "first" && (
            <span className="text-blue-600">
              <ChevronRightCircleIcon className="size-3" />
            </span>
          )}
        </>
      )}
    </span>
  );
};
