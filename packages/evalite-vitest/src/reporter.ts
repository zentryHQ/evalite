import type { RunnerTask, RunnerTestFile, TaskResultPack } from "vitest";
import { BasicReporter } from "vitest/reporters";

import { appendToJsonDb, DEFAULT_SERVER_PORT } from "@evalite/core";
import c from "tinyrainbow";
import { runServer, type Server } from "./server.js";

export default class EvaliteReporter extends BasicReporter {
  // private server: Server;
  constructor() {
    super();
    // this.server = runServer({
    //   port: DEFAULT_SERVER_PORT,
    //   jsonDbLocation: "./evalite-report.jsonl",
    // });
  }

  override onInit(ctx: any): void {
    this.ctx = ctx;
    this.start = performance.now();

    this.ctx.logger.log(
      ` ${c.magenta(c.bold("EVALITE"))} ${c.dim("running on")} ` +
        c.cyan(`http://localhost:${c.bold(DEFAULT_SERVER_PORT)}/`)
    );
    this.ctx.logger.log("");

    // this.server.send({
    //   type: "RUN_IN_PROGRESS",
    // });
  }

  override onTaskUpdate(packs: TaskResultPack[]): void {
    // this.server.send({
    //   type: "RUN_IN_PROGRESS",
    // });
    super.onTaskUpdate(packs);
  }

  override onWatcherStart(files?: RunnerTestFile[], errors?: unknown[]): void {
    super.onWatcherStart(files, errors);
  }

  override onWatcherRerun(files: string[], trigger?: string): void {
    super.onWatcherRerun(files, trigger);
  }

  override onFinished = async (
    files = this.ctx.state.getFiles(),
    errors = this.ctx.state.getUnhandledErrors()
  ) => {
    // this.server.send({
    //   type: "RUN_COMPLETE",
    // });

    await appendToJsonDb({
      dbLocation: __evalite_globals.jsonDbLocation,
      files,
    });

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

    const hasNoEvalite = task.tasks.every((t) => !t.meta.evalite);

    if (hasNoEvalite) {
      return super.printTask(task);
    }

    const scores: number[] = [];

    const failed = task.tasks.some((t) => t.result?.state === "fail");

    for (const { meta, result } of task.tasks) {
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

    const failedTasks = files.filter((file) => {
      return file.tasks.some((task) => task.result?.state === "fail");
    });

    const scoreDisplay =
      failedTasks.length > 0
        ? c.red("✖ ") + c.dim(`(${failedTasks.length} failed)`)
        : c.bold(scoreColor(averageScore + "%"));

    this.ctx.logger.log(
      ["      ", c.dim("Score"), "  ", scoreDisplay].join("")
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
