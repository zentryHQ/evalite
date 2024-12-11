import type { RunnerTask, RunnerTestFile, TaskResultPack } from "vitest";
import { BasicReporter } from "vitest/reporters";

import { type Evalite } from "@evalite/core";
import { table } from "table";
import c from "tinyrainbow";
import { average, sum } from "./utils.js";
import { inspect } from "util";
import { saveRun, type SQLiteDatabase } from "@evalite/core/db";

export interface EvaliteReporterOptions {
  isWatching: boolean;
  port: number;
  logNewState: (event: Evalite.ServerState) => void;
  db: SQLiteDatabase;
}

const renderers = {
  title: () => {
    return c.magenta(c.bold("EVALITE"));
  },
  description: (opts: EvaliteReporterOptions) => {
    if (opts.isWatching) {
      return [
        c.dim("running on "),
        c.cyan(`http://localhost:${c.bold(opts.port)}/`),
      ].join("");
    }

    return c.dim("running...");
  },
};

type ReporterEvent =
  | {
      type: "RUN_BEGUN";
      filepaths: string[];
      runType: Evalite.RunType;
    }
  | {
      type: "RUN_ENDED";
    };

export default class EvaliteReporter extends BasicReporter {
  private opts: EvaliteReporterOptions;
  private lastRunTypeLogged: Evalite.RunType = "full";
  private state: Evalite.ServerState = { type: "idle" };

  // private server: Server;
  constructor(opts: EvaliteReporterOptions) {
    super();
    this.opts = opts;
  }
  override onInit(ctx: any): void {
    this.ctx = ctx;
    this.start = performance.now();

    this.ctx.logger.log("");
    this.ctx.logger.log(
      ` ${renderers.title()} ${renderers.description(this.opts)}`
    );
    this.ctx.logger.log("");

    this.sendEvent({
      type: "RUN_BEGUN",
      filepaths: this.ctx.state.getFiles().map((f) => f.filepath),
      runType: "full",
    });
    this.lastRunTypeLogged = "full";
  }

  override onWatcherStart(files?: RunnerTestFile[], errors?: unknown[]): void {
    super.onWatcherStart(files, errors);
  }

  updateState(state: Evalite.ServerState) {
    this.state = state;
    this.opts.logNewState(state);
  }

  /**
   * Handles the state management for the reporter
   */
  sendEvent(event: ReporterEvent): void {
    switch (event.type) {
      case "RUN_BEGUN":
        this.updateState({
          filepaths: event.filepaths,
          runType: event.runType,
          type: "running",
        });
        break;
      case "RUN_ENDED":
        this.updateState({ type: "idle" });
        break;
      default:
        event satisfies never;
        throw new Error("Unknown event type");
    }
  }

  override onWatcherRerun(files: string[], trigger?: string): void {
    this.sendEvent({
      type: "RUN_BEGUN",
      filepaths: files,
      runType: "partial",
    });
    this.lastRunTypeLogged = "partial";
    super.onWatcherRerun(files, trigger);
  }

  override onFinished = async (
    files = this.ctx.state.getFiles(),
    errors = this.ctx.state.getUnhandledErrors()
  ) => {
    this.sendEvent({
      type: "RUN_ENDED",
    });

    saveRun(this.opts.db, { files, runType: this.lastRunTypeLogged });

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

    for (const { meta } of task.tasks) {
      if (meta.evalite) {
        scores.push(
          ...meta.evalite!.results.flatMap((r) =>
            r.scores.map((s) => s.score ?? 0)
          )
        );
      }
    }

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = totalScore / scores.length;

    const title = failed ? c.red("✖") : displayScore(averageScore);

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
    // this.printErrorsSummary(errors); // TODO

    const evals = files.flatMap((file) =>
      file.tasks.filter((task) => task.meta.evalite)
    );

    const scores = evals.flatMap((task) =>
      task.meta.evalite!.results.flatMap((r) => r.scores.map((s) => s.score))
    );

    const totalScore = sum(scores, (score) => score ?? 0);
    const averageScore = totalScore / scores.length;

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
        : displayScore(averageScore);

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

    if (evals.length === 1 && evals[0]) {
      this.renderTable(
        evals[0].meta.evalite!.results.map((result) => ({
          input: result.input,
          output: result.output,
          score: average(result.scores, (s) => s.score ?? 0),
        }))
      );
    }
  }

  private renderTable(
    props: {
      input: unknown;
      output: unknown;
      score: number;
    }[]
  ) {
    this.ctx.logger.log("");

    const availableColumns = process.stdout.columns || 80;

    const scoreWidth = 5;
    const columnsWritableWidth = 11;
    const availableInnerSpace =
      availableColumns - columnsWritableWidth - scoreWidth;

    const colWidth = Math.min(Math.floor(availableInnerSpace / 2), 80);

    this.ctx.logger.log(
      table(
        [
          [
            c.cyan(c.bold("Input")),
            c.cyan(c.bold("Output")),
            c.cyan(c.bold("Score")),
          ],
          ...props.map((p) => [
            typeof p.input === "object"
              ? inspect(p.input, {
                  colors: true,
                  depth: null,
                  breakLength: colWidth,
                  numericSeparator: true,
                  compact: true,
                })
              : p.input,
            typeof p.output === "object"
              ? inspect(p.output, {
                  colors: true,
                  depth: null,
                  breakLength: colWidth,
                  numericSeparator: true,
                  compact: true,
                })
              : p.output,
            displayScore(p.score),
          ]),
        ],
        {
          columns: [
            { width: colWidth, wrapWord: typeof props[0]?.input === "string" },
            { width: colWidth, wrapWord: typeof props[0]?.output === "string" },
            { width: scoreWidth },
          ],
        }
      )
    );
  }
}

const displayScore = (score: number) => {
  const percentageScore = Math.round(score * 100);
  if (percentageScore >= 80) {
    return c.bold(c.green(percentageScore + "%"));
  } else if (percentageScore >= 50) {
    return c.bold(c.yellow(percentageScore + "%"));
  } else {
    return c.bold(c.red(percentageScore + "%"));
  }
};
