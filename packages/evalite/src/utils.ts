import { fileTypeFromBuffer } from "file-type";
import path from "path";

export const sum = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => a + (fn(b) || 0), 0);
};

export const average = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return sum(arr, fn) / arr.length;
};

export const createEvaliteFileIfNeeded = async (opts: {
  rootDir: string;
  input: unknown;
}) => {
  if (!(opts.input instanceof Uint8Array)) {
    return opts.input;
  }

  const { createHash } = await import("node:crypto");

  const hash = createHash("sha256").update(opts.input).digest("hex");

  const result = await fileTypeFromBuffer(opts.input);

  if (!result) {
    throw new Error(`Cannot determine file type of buffer passed in.`);
  }

  const extension = result.ext;

  const fileName = `${hash}.${extension}`;

  const filePath = path.join(opts.rootDir, fileName);

  const { writeFile } = await import("node:fs/promises");

  await writeFile(filePath, opts.input);

  return EvaliteFile.fromPath(filePath);
};

export const max = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => Math.max(a, fn(b) || 0), 0);
};

import type { Evalite } from "./types.js";

const isEvaliteFile = (file: unknown): file is Evalite.File => {
  return (
    typeof file === "object" &&
    file !== null &&
    "__EvaliteFile" in file &&
    file.__EvaliteFile === true
  );
};

export const EvaliteFile = {
  fromPath: (path: string): Evalite.File => {
    return {
      __EvaliteFile: true,
      path,
    };
  },
  isEvaliteFile: isEvaliteFile,
};
