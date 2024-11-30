import { expect, it } from "vitest";
import { runVitest } from "../command.js";
import { captureStdout, loadFixture } from "./test-utils.js";
import { readdirSync } from "fs";

it("Should report the basics correctly", async () => {
  using fixture = loadFixture("basics");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  expect(captured.getOutput()).toContain("Duration");
  expect(captured.getOutput()).toContain("Score  100%");
  expect(captured.getOutput()).toContain("Eval Files  1");
  expect(captured.getOutput()).toContain("Evals  1");
  expect(captured.getOutput()).toContain("100% basics.eval.ts  (1 eval)");
});

it("Should create a evalite-report.jsonl", async () => {
  using fixture = loadFixture("basics");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  const dir = readdirSync(fixture.dir);

  console.log(dir);
});
