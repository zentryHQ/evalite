import path from "path";
import { mkdir } from "fs/promises";
import { Writable } from "stream";
import { createVitest, registerConsoleShortcuts } from "vitest/node";
import EvaliteReporter from "./reporter.js";
import { createHash } from "crypto";
import { DB_LOCATION, DEFAULT_SERVER_PORT } from "@evalite/core";
import {
  DB_LOCATION,
  DEFAULT_SERVER_PORT,
  type JsonDBEvent,
} from "@evalite/core";
import { createServer } from "@evalite/core/server";
import { createDatabase, saveRun, type SQLiteDatabase } from "@evalite/core/db";

export const runVitest = async (opts: {
  path: string | undefined;
  cwd: string | undefined;
  testOutputWritable?: Writable;
  mode: "watch-for-file-changes" | "run-once-and-exit";
  testTimeout?: number;
}) => {
  const dbLocation = path.join(opts.cwd ?? "", DB_LOCATION);
  await mkdir(path.dirname(dbLocation), { recursive: true });

  const db = createDatabase(dbLocation);
  const filters = opts.path ? [opts.path] : undefined;

  process.env.EVALITE_REPORT_TRACES = "true";

  let server: ReturnType<typeof createServer> | undefined = undefined;

  if (opts.mode === "watch-for-file-changes") {
    server = createServer({
      db: db,
    });
    server.start(DEFAULT_SERVER_PORT);
  }

  const vitest = await createVitest(
    "test",
    {
      root: opts.cwd,
      include: ["**/*.eval.{js,ts}"],
      watch: opts.mode === "watch-for-file-changes",
      sequence: {
        concurrent: true,
      },
      reporters: [
        new EvaliteReporter({
          logEvent: (event) => {
            server?.send(event);
          },
          port: DEFAULT_SERVER_PORT,
          isWatching: opts.mode === "watch-for-file-changes",
          db: db,
        }),
      ],
      testTimeout: opts.testTimeout ?? 30_000,
    },
    {},
    {
      stdout: opts.testOutputWritable || process.stdout,
      stderr: opts.testOutputWritable || process.stderr,
    }
  );

  await vitest.collect(filters);

  const allFileResults = Array.from(vitest.vitenode.fetchCache);

  const sourceFileResults = allFileResults.filter(([path, item]) => {
    return !(path.endsWith(".eval.ts") || path.endsWith(".eval.js"));
  });

  const codeFromSourceFiles = sourceFileResults.reduce((acc, [path, item]) => {
    return acc + (item.result.code ?? "");
  }, "");

  const hash = createHash("sha256").update(codeFromSourceFiles).digest("hex");

  vitest.provide("evaliteInputHash", hash);

  await vitest.start(filters);

  const dispose = registerConsoleShortcuts(
    vitest,
    process.stdin,
    process.stdout
  );

  if (!vitest.shouldKeepServer()) {
    dispose();
    return await vitest.exit();
  }
};
