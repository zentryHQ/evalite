import { getJsonDbEvals } from "@evalite/core";
import { expect, it } from "vitest";
import { runVitest } from "evalite/runner";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report traces from reportTrace", async () => {
  using fixture = loadFixture("traces");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  expect(evals.Traces![0]).toMatchObject({
    results: [
      {
        traces: [
          {
            duration: 100,
            end: 100,
            output: "abcdef",
            prompt: [
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
