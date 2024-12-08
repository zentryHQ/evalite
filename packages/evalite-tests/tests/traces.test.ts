import { expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";
import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";

it("Should report traces from reportTrace", async () => {
  using fixture = loadFixture("traces");

  const captured = captureStdout();
  const db = createDatabase(":memory:");

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
    db,
  });

  const evals = await getEvalsAsRecord(db);

  expect(evals.Traces![0]).toMatchObject({
    results: [
      {
        traces: [
          {
            duration: 100,
            end: 100,
            output: "abcdef",
            input: [
              {
                content: "abc",
                role: "input",
              },
            ],
            start: 0,
            usage: {
              completionTokens: 1,
              promptTokens: 1,
            },
          },
        ],
      },
    ],
  });
});
