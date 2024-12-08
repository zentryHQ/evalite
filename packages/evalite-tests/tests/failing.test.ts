import { expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import { createDatabase } from "@evalite/core/db";

it("Should report a failing test", async () => {
  using fixture = loadFixture("failing-test");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    testTimeout: 3000,
  });

  expect(captured.getOutput()).toContain("failing-test.eval.ts");
  expect(captured.getOutput()).toContain("Score  ✖ (1 failed)");
});
