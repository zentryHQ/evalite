import type { Evalite } from "./types.js";

export const sum = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => a + (fn(b) || 0), 0);
};

export const average = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return sum(arr, fn) / arr.length;
};

export const max = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => Math.max(a, fn(b) || 0), 0);
};

export const isEvaliteFile = (file: unknown): file is Evalite.File => {
  return (
    typeof file === "object" &&
    file !== null &&
    "__EvaliteFile" in file &&
    file.__EvaliteFile === true
  );
};
