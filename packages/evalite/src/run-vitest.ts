import path from "path";
import { Writable } from "stream";
import { createVitest } from "vitest/node";
import EvaliteReporter from "./reporter.js";
import { createHash } from "crypto";

export const runVitest = async (opts: {
  path: string | undefined;
  cwd: string | undefined;
  testOutputWritable?: Writable;
}) => {
  const vitest = await createVitest(
    "test",
    {
      root: opts.cwd,
      include: ["**/*.eval.{js,ts}"],
      watch: false,
      reporters: [
        new EvaliteReporter({
          jsonDbLocation: path.join(opts.cwd ?? "", "./evalite-report.jsonl"),
        }),
      ],
    },
    {},
    {
      stdout: opts.testOutputWritable || process.stdout,
      stderr: opts.testOutputWritable || process.stderr,
    }
  );

  await vitest.collect();

  const allFileResults = Array.from(vitest.vitenode.fetchCache);

  const sourceFileResults = allFileResults.filter(([path, item]) => {
    return !(path.endsWith(".eval.ts") || path.endsWith(".eval.js"));
  });

  const codeFromSourceFiles = sourceFileResults.reduce((acc, [path, item]) => {
    return acc + (item.result.code ?? "");
  }, "");

  const hash = createHash("sha256").update(codeFromSourceFiles).digest("hex");

  vitest.provide("evaliteInputHash", hash);

  await vitest.start();

  if (!vitest.shouldKeepServer()) {
    return await vitest.exit();
  }
};
