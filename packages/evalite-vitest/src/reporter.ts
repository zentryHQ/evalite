import type { RunnerTestFile } from "vitest";
import { BasicReporter } from "vitest/reporters";

export default class EvaliteReporter extends BasicReporter {
  override onInit(ctx: any): void {
    super.onInit(ctx);
    console.log("Load server");
  }

  override onFinished = async (files: RunnerTestFile[]) => {
    const data: {
      file: string;
      task: string;
      input: unknown;
      result: unknown;
      scores: { score: number; name: string }[];
    }[] = [];

    for (const file of files) {
      for (const task of file.tasks) {
        if (task.meta.evalite) {
          for (const { input, result, scores } of task.meta.evalite.results) {
            data.push({
              file: file.name,
              task: task.name,
              input,
              result,
              scores,
            });
          }
        }
      }
    }

    console.dir(data, { depth: null });
  };
}
