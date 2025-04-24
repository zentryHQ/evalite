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
