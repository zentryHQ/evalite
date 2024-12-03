import { expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import { getJsonDbEvals } from "@evalite/core";
import { createScorer } from "evalite";

it("Should let users create custom scorers", async () => {
  using fixture = loadFixture("custom-scorer");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  const evals = await getJsonDbEvals({
    dbLocation: fixture.jsonDbLocation,
  });

  expect(evals.Index![0]?.results[0]?.scores[0]?.name).toBe("Is Same");
  expect(evals.Index![0]?.results[0]?.scores[0]?.score).toBe(1);
});

it("Should fail if the custom scorer does not return a number", async () => {
  const scorer = createScorer<string>("Is Same", ({ output, expected }) => {
    return "1" as any;
  });

  await expect(() => scorer({ output: "awdawd" })).rejects.toThrowError(
    "The scorer 'Is Same' must return a number."
  );
});
