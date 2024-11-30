import { expect, it } from "vitest";
import { runVitest } from "../command.js";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report a failing test", async () => {
  using fixture = loadFixture("failing-test");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  expect(captured.getOutput()).toContain("✖ failing-test.eval.ts  (1 eval)");
  expect(captured.getOutput()).toContain("Score  ✖ (1 failed)");
});
