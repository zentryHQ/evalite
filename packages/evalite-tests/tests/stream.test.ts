import { runVitest } from "evalite/runner";
import { expect, it } from "vitest";
import { loadFixture, captureStdout } from "./test-utils";
import { createDatabase, getEvalsAsRecord } from "evalite/db";

it("Should be able to handle a stream", async () => {
  using fixture = loadFixture("stream");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals.Stream?.[0]?.results[0]?.output).toBe("abcdef");
});
