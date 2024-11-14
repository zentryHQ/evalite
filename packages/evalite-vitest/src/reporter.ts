import type { RunnerTask, RunnerTestFile, TaskResultPack } from "vitest";
import { BasicReporter } from "vitest/reporters";
import type { Evalite } from "./index.js";

import c from "tinyrainbow";
import { writeFile } from "fs/promises";

export const sum = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return arr.reduce((a, b) => a + (fn(b) || 0), 0);
};

export const average = <T>(arr: T[], fn: (item: T) => number | undefined) => {
  return sum(arr, fn) / arr.length;
};

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

    type ReadableTask = {
      task: string;
      score: number;
      duration: number;
      results: {
        input: unknown;
        result: unknown;
        scores: Evalite.Score[];
        duration: number;
      }[];
    };

    type ReadableFile = {
      file: string;
      score: number;
      tasks: ReadableTask[];
    };

    const readableReports: ReadableFile[] = [];

    for (const file of files) {
      const report: ReadableFile = {
        file: file.name,
        score: average(file.tasks, (task) => {
          return average(task.meta.evalite?.results || [], (t) => {
            return average(t.scores, (s) => s.score);
          });
        }),
        tasks: [],
      };
      for (const task of file.tasks) {
        const readableTask: ReadableTask = {
          task: task.name,
          score: average(task.meta.evalite?.results || [], (t) => {
            return average(t.scores, (s) => s.score);
          }),
          duration: task.meta.evalite?.duration ?? 0,
          results: [],
        };

        if (task.meta.evalite) {
          for (const { input, result, scores, duration } of task.meta.evalite
            .results) {
            data.push({
              file: file.name,
              task: task.name,
              input,
              result,
              scores,
            });

            readableTask.results.push({
              input,
              result,
              scores,
              duration,
            });
          }
        }

        report.tasks.push(readableTask);
      }

      readableReports.push(report);
    }

    await writeFile(
      "./report.json",
      JSON.stringify(readableReports, null, 2),
      "utf-8"
    );

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

    let failed = false;

    for (const { meta, result } of task.tasks) {
      if ((result?.errors?.length || 0) > 0) {
        failed = true;
        break;
      }
      if (meta.evalite) {
        scores.push(
          ...meta.evalite!.results.flatMap((r) => r.scores.map((s) => s.score))
        );
      }
    }

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round((totalScore / scores.length) * 100);

    const color =
      averageScore >= 80 ? c.green : averageScore >= 50 ? c.yellow : c.red;

    const title = failed ? c.red("✖") : c.bold(color(averageScore + "%"));

    const toLog = [
      ` ${title} `,
      `${task.name}  `,
      c.dim(
        `(${task.tasks.length} ${task.tasks.length > 1 ? "evals" : "eval"})`
      ),
    ];

    // if (task.result.duration) {
    //   toLog.push(" " + c.dim(`${Math.round(task.result.duration ?? 0)}ms`));
    // }

    this.ctx.logger.log(toLog.join(""));
  }

  override reportTestSummary(files: RunnerTestFile[], errors: unknown[]): void {
    const scores = files.flatMap((file) =>
      file.tasks.flatMap((task) => {
        if (task.meta.evalite) {
          return task.meta.evalite.results.flatMap((r) =>
            r.scores.map((s) => s.score)
          );
        }
        return [];
      })
    );

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round((totalScore / scores.length) * 100);

    const scoreColor =
      averageScore >= 80 ? c.green : averageScore >= 50 ? c.yellow : c.red;

    const collectTime = files.reduce((a, b) => a + (b.collectDuration || 0), 0);
    const testsTime = files.reduce((a, b) => a + (b.result?.duration || 0), 0);
    const setupTime = files.reduce((a, b) => a + (b.setupDuration || 0), 0);

    const totalDuration = collectTime + testsTime + setupTime;

    this.ctx.logger.log(
      [
        "      ",
        c.dim("Score"),
        "  ",
        c.bold(scoreColor(averageScore + "%")),
      ].join("")
    );

    this.ctx.logger.log(
      [" ", c.dim("Eval Files"), "  ", files.length].join("")
    );

    this.ctx.logger.log(
      [
        "      ",
        c.dim("Evals"),
        "  ",
        files.reduce((a, b) => a + b.tasks.length, 0),
      ].join("")
    );

    this.ctx.logger.log(
      ["   ", c.dim("Duration"), "  ", `${Math.round(totalDuration)}ms`].join(
        ""
      )
    );

    // super.reportTestSummary(files, errors);
  }
}
