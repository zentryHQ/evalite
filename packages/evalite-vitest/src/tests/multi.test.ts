import { expect, it } from "vitest";
import { runVitest } from "../command.js";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report multiple evals correctly", async () => {
  using fixture = loadFixture("multi");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  expect(captured.getOutput()).toContain("Duration");
  expect(captured.getOutput()).toContain("Score  100%");
  expect(captured.getOutput()).toContain("Eval Files  3");
  expect(captured.getOutput()).toContain("Evals  4");
  expect(captured.getOutput()).toContain("100% multi-1.eval.ts  (1 eval)");
  expect(captured.getOutput()).toContain("100% multi-2.eval.ts  (1 eval)");
  expect(captured.getOutput()).toContain("100% multi-3.eval.ts  (2 evals)");
});
