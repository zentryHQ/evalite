import { expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import { createScorer } from "evalite";
import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";

it("Should let users create custom scorers", async () => {
  using fixture = loadFixture("custom-scorer");

  const captured = captureStdout();
  const db = createDatabase(":memory:");

  await runVitest({
    cwd: fixture.dir,

    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    db,
  });

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals.Index![0]?.results[0]?.scores[0]?.name).toBe("Is Same");
  expect(evals.Index![0]?.results[0]?.scores[0]?.score).toBe(1);
});

it("Should fail if the custom scorer does not return a number", async () => {
  const scorer = createScorer<string>({
    name: "Is Same",
    // @ts-expect-error
    scorer: async (input) => {
      return input === ("awdawd" as any);
    },
  });

  await expect(() =>
    scorer({
      // @ts-expect-error
      output: "awdawd",
    })
  ).rejects.toThrowError("The scorer 'Is Same' must return a number.");
});
