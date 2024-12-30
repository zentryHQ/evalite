import { type Evalite } from "@evalite/core";
import { isEvaliteFile } from "@evalite/core/utils";

export const EvaliteFile = {
  fromPath: (path: string): Evalite.File => {
    return {
      __EvaliteFile: true,
      path,
    };
  },
  isEvaliteFile: isEvaliteFile,
};
