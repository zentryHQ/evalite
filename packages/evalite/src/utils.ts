import { createHash } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { writeFile } from "fs/promises";
import path from "path";
import { EvaliteFile } from "./evalite-file.js";

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
  if (!Buffer.isBuffer(opts.input)) {
    return opts.input;
  }

  const hash = createHash("sha256").update(opts.input).digest("hex");

  const result = await fileTypeFromBuffer(opts.input);

  if (!result) {
    throw new Error(`Cannot determine file type of buffer passed in.`);
  }

  const extension = result.ext;

  const fileName = `${hash}.${extension}`;

  const filePath = path.join(opts.rootDir, fileName);

  await writeFile(filePath, opts.input);

  return EvaliteFile.fromPath(filePath);
};
