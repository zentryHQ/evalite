import { runVitest } from "evalite/runner";
import { expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";
import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";

it("Should allow you to render columns based on the input and output", async () => {
  using fixture = loadFixture("columns");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals.Columns![0]).toMatchObject({
    results: [
      {
        rendered_columns: [
          { label: "Input First", value: "abc" },
          { label: "Expected Last", value: 123 },
          { label: "Output Last", value: 123 },
        ],
      },
    ],
  });
});
