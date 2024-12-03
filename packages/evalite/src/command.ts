import { Command } from "commander";
import { runVitest } from "./run-vitest.js";

declare module "vitest" {
  export interface ProvidedContext {
    evaliteInputHash: string;
  }
}

export const program = new Command();

program.description("Run evals").action(() => {
  runVitest({
    path: undefined,
    cwd: undefined,
  });
});

program
  .command("<path>")
  .description("Run evals at path")
  .action((path) => {
    runVitest({ path, cwd: undefined });
  });
