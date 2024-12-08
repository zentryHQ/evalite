import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";
import { runVitest } from "evalite/runner";
import { expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should report long datasets consistently in the same order", async () => {
  using fixture = loadFixture("much-data");

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

  const jsonDbEvals = await getEvalsAsRecord(db);

  expect(jsonDbEvals["Much Data"]![0]!.results).toMatchObject([
    {
      input: "first",
    },
    {
      input: "second",
    },
    {
      input: "third",
    },
    {
      input: "fourth",
    },
  ]);
});
