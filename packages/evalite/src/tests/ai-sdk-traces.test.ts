import { getJsonDbEvals } from "@evalite/core";
import { expect, it } from "vitest";
import { runVitest } from "../command.js";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report traces from traceAISDKModel", async () => {
  using fixture = loadFixture("ai-sdk-traces");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
  });

  const evals = await getJsonDbEvals({ dbLocation: fixture.jsonDbLocation });

  expect(evals["AI SDK Traces"]![0]?.results[0]?.traces).toHaveLength(1);
});
