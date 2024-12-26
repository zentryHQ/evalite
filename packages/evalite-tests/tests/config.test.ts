import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";
import { runVitest } from "evalite/runner";
import { assert, expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should ignore includes in a vite.config.ts", async () => {
  using fixture = loadFixture("config-includes");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    mode: "run-once-and-exit",
    testOutputWritable: captured.writable,
  });

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals.Basics).toHaveLength(1);
});
