import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";
import { runVitest } from "evalite/runner";
import { expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report traces from traceAISDKModel", async () => {
  using fixture = loadFixture("ai-sdk-traces");

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

  expect(evals["AI SDK Traces"]![0]?.results[0]?.traces).toHaveLength(1);
});
