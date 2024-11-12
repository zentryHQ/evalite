import type { RunnerTask, RunnerTestFile, TaskResultPack } from "vitest";
import { BasicReporter } from "vitest/reporters";
import type { Evalite } from "./index.js";

import c from "tinyrainbow";

export default class EvaliteReporter extends BasicReporter {
  override onInit(ctx: any): void {
    this.ctx = ctx;
    this.start = performance.now();
    // this.ctx.logger.log("TODO: Start Dev Server");
  }

  override onFinished = async (
    files = this.ctx.state.getFiles(),
    errors = this.ctx.state.getUnhandledErrors()
  ) => {
    const data: Evalite.TaskReport[] = [];

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

    // this.ctx.logger.log("TODO: Report Run");
    super.onFinished(files, errors);
  };

  protected override printTask(task: RunnerTask): void {
    // Tasks can be files or individual tests, and
    // this ensures we only print files
    if (
      !("filepath" in task) ||
      !task.result?.state ||
      task.result?.state === "run"
    ) {
      return;
    }

    const scores: number[] = [];

    for (const { meta } of task.tasks) {
      if (meta.evalite) {
        scores.push(
          ...meta.evalite!.results.flatMap((r) => r.scores.map((s) => s.score))
        );
      }
    }

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = ((totalScore / scores.length) * 100).toFixed(1);

    const toLog = [
      ` ${c.green(averageScore)}${c.dim("%")} `,
      `${task.name}  `,
      c.dim(
        `(${task.tasks.length} ${task.tasks.length > 1 ? "evals" : "eval"})`
      ),
    ];

    if (task.result.duration) {
      toLog.push(" " + c.dim(`${Math.round(task.result.duration ?? 0)}ms`));
    }

    this.ctx.logger.log(toLog.join(""));
  }
}
