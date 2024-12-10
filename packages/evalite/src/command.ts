import { Command } from "commander";
import { runVitest } from "./run-vitest.js";

export const program = new Command();

program.description("Run evals once and exit").action(() => {
  runVitest({
    path: undefined,
    cwd: undefined,
    mode: "run-once-and-exit",
  });
});

program
  .command("watch [path]")
  .description("Watch evals for file changes")
  .action((path: string | undefined) => {
    runVitest({
      path,
      cwd: undefined,
      mode: "watch-for-file-changes",
    });
  });

program
  .command("<path>")
  .description("Run evals at specified path once and exit")
  .action((path) => {
    runVitest({ path, cwd: undefined, mode: "run-once-and-exit" });
  });
