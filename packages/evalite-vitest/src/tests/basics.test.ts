import { getJsonDbEvals } from "@evalite/core";
import { assert, expect, it } from "vitest";
import { runVitest } from "../command.js";
import { captureStdout, loadFixture } from "./test-utils.js";

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

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  expect(evals).toMatchObject({
    Basics: [
      {
        name: "Basics",
        results: [
          {
            scores: [
              {
                name: "Levenshtein",
                score: 1,
              },
            ],
          },
        ],
      },
    ],
  });
});

it("Should capture the duration as being more than 0", async () => {
  using fixture = loadFixture("basics");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  assert(typeof evals.Basics?.[0]?.duration === "number", "Duration exists");
  expect(evals.Basics?.[0]?.duration).toBeGreaterThan(0);
});
