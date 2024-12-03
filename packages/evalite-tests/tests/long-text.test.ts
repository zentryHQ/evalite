import { getJsonDbEvals } from "@evalite/core";
import { assert, expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report long text correctly", async () => {
  using fixture = loadFixture("long-text");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  expect(captured.getOutput()).toContain("Input");
  expect(captured.getOutput()).toContain("Output");
  expect(captured.getOutput()).toContain("Score");
  expect(captured.getOutput()).toContain("Some extremely long text");
});
