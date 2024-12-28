import type { Evalite } from "@evalite/core";
import type { EvaliteFile } from "./evalite-file.js";

export const sum = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => a + (fn(b) || 0), 0);
};

export const average = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return sum(arr, fn) / arr.length;
};
