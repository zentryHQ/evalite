import { createDatabase, getEvalsAsRecord, type Db } from "evalite/db";
import { runVitest } from "evalite/runner";
import { expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report a failing test", async () => {
  using fixture = loadFixture("failing-test");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  expect(captured.getOutput()).toContain("failing-test.eval.ts");
  expect(captured.getOutput()).toContain("Score  ✖ (1 failed)");

  // Should not display a table
  expect(captured.getOutput()).not.toContain("Input");
});

it("Should save the result AND eval as failed in the database", async () => {
  using fixture = loadFixture("failing-test");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals.Failing?.[0]).toMatchObject({
    name: "Failing",
    status: "fail" satisfies Db.EvalStatus,
    results: [
      {
        status: "fail",
      },
    ],
  });
});
