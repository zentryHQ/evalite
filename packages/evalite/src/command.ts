import { Command } from "commander";
import { runVitest } from "./run-vitest.js";
import { createDatabase } from "@evalite/core/db";

declare module "vitest" {
  export interface ProvidedContext {
    evaliteInputHash: string;
  }
}

export const program = new Command();

program.description("Run evals once and exit").action(() => {
  const db = createDatabase(":memory:");
  runVitest({
    db,
    path: undefined,
    cwd: undefined,
    mode: "run-once-and-exit",
  });
});

program
  .command("watch [path]")
  .description("Watch evals for file changes")
  .action((path: string | undefined) => {
    const db = createDatabase(":memory:");
    runVitest({
      db,
      path,
      cwd: undefined,
      mode: "watch-for-file-changes",
    });
  });

program
  .command("<path>")
  .description("Run evals at specified path once and exit")
  .action((path) => {
    const db = createDatabase(":memory:");
    runVitest({ path, cwd: undefined, mode: "run-once-and-exit", db });
  });
