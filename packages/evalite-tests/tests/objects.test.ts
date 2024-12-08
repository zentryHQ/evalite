import { assert, expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import {
  createDatabase,
  getEvals,
  getEvalsAsRecord,
  getMostRecentRun,
  getRun,
} from "@evalite/core/db";

it("Should handle objects as inputs and outputs", async () => {
  using fixture = loadFixture("objects");

  const captured = captureStdout();
  const db = createDatabase(":memory:");

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    db,
  });

  const run = getMostRecentRun(db, "full");

  assert(run);

  const evals = getEvals(db, run.id);

  expect(evals).toMatchObject([{}]);
});
