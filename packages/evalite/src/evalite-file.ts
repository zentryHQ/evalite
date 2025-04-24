import type { Evalite } from "./types.js";
import { isEvaliteFile } from "./utils.js";

export const EvaliteFile = {
  fromPath: (path: string): Evalite.File => {
    return {
      __EvaliteFile: true,
      path,
    };
  },
  isEvaliteFile: isEvaliteFile,
};
