import { assert, expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";

it("Should allow you to pass a specific filename to run", async () => {
  using fixture = loadFixture("paths");

  const captured = captureStdout();
  const db = createDatabase(":memory:");

  await runVitest({
    cwd: fixture.dir,
    path: "should-run.eval.ts",
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    db,
  });
  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals["Should Run"]).toHaveLength(1);
  expect(evals["Should Not Run"]).not.toBeDefined();
});

it("Should allow you to pass a filename filter", async () => {
  using fixture = loadFixture("paths");

  const captured = captureStdout();
  const db = createDatabase(":memory:");

  await runVitest({
    cwd: fixture.dir,
    path: "should-run",
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    db,
  });
  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals["Should Run"]).toHaveLength(1);
  expect(evals["Should Not Run"]).not.toBeDefined();
});
