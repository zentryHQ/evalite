import { Command } from "commander";
import path from "path";
import { Writable } from "stream";
import { createVitest } from "vitest/node";

declare global {
  var __evalite_globals: {
    readonly jsonDbLocation: string;
  };
}

export const runVitest = async (opts: {
  path: string | undefined;
  cwd: string | undefined;
  testOutputWritable?: Writable;
}) => {
  globalThis.__evalite_globals = {
    jsonDbLocation: path.join(opts.cwd ?? "", "./evalite-report.jsonl"),
  };
  const vitest = await createVitest(
    "test",
    {
      root: opts.cwd,
      include: ["**/*.eval.{js,ts}"],
      watch: false,
      reporters: ["evalite-vitest/reporter"],
    },
    {},
    {
      stdout: opts.testOutputWritable || process.stdout,
      stderr: opts.testOutputWritable || process.stderr,
    }
  );

  await vitest.start();

  if (!vitest.shouldKeepServer()) {
    return await vitest.exit();
  }
};

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
