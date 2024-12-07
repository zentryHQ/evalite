import { getJsonDbEvals } from "@evalite/core";
import { assert, expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should allow you to pass a specific filename to run", async () => {
  using fixture = loadFixture("paths");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: "should-run.eval.ts",
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  expect(evals["Should Run"]).toHaveLength(1);
  expect(evals["Should Not Run"]).not.toBeDefined();
});

it("Should allow you to pass a filename filter", async () => {
  using fixture = loadFixture("paths");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: "should-run",
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  expect(evals["Should Run"]).toHaveLength(1);
  expect(evals["Should Not Run"]).not.toBeDefined();
});
