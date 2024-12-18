import { DB_LOCATION, DEFAULT_SERVER_PORT } from "@evalite/core";
import { createDatabase } from "@evalite/core/db";
import { createServer } from "@evalite/core/server";
import { createHash } from "crypto";
import { mkdir } from "fs/promises";
import path from "path";
import { Writable } from "stream";
import { createVitest, registerConsoleShortcuts } from "vitest/node";
import EvaliteReporter from "./reporter.js";

export const runVitest = async (opts: {
  path: string | undefined;
  cwd: string | undefined;
  testOutputWritable?: Writable;
  mode: "watch-for-file-changes" | "run-once-and-exit";
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
      // Everything passed here cannot be overridden
      root: opts.cwd,
      watch: opts.mode === "watch-for-file-changes",
      reporters: [
        new EvaliteReporter({
          logNewState: (newState) => {
            server?.updateState(newState);
          },
          port: DEFAULT_SERVER_PORT,
          isWatching: opts.mode === "watch-for-file-changes",
          db: db,
        }),
      ],
    },
    {
      plugins: [
        {
          name: "evalite-config-plugin",
          // Everything inside this config CAN be overridden
          config(config) {
            config.test ??= {};
            config.test.testTimeout ??= 30_000;
            config.test.include ??= ["**/*.eval.ts"];

            config.test.sequence ??= {};
            config.test.sequence.concurrent ??= true;
          },
        },
      ],
    },
    {
      stdout: opts.testOutputWritable || process.stdout,
      stderr: opts.testOutputWritable || process.stderr,
    }
  );

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
