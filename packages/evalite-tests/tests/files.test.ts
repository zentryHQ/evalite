import { FILES_LOCATION } from "@evalite/core";
import { createDatabase, getEvalsAsRecord } from "@evalite/core/db";
import { EvaliteFile } from "evalite";
import { runVitest } from "evalite/runner";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, it } from "vitest";
import { captureStdout, loadFixture } from "./test-utils.js";

it("Should save files returned from task() in node_modules", async () => {
  const fixture = loadFixture("files");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const dir = path.join(fixture.dir, FILES_LOCATION);

  const files = await readdir(dir);

  expect(files).toHaveLength(1);

  const filePath = path.join(dir, files[0]!);

  const file = await readFile(filePath);

  expect(file).toBeTruthy();

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals).toMatchObject({
    Files: [
      {
        results: [
          {
            output: EvaliteFile.fromPath(filePath),
          },
        ],
      },
    ],
  });
});

it("Should save files reported in traces", async () => {
  using fixture = loadFixture("files");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const dir = path.join(fixture.dir, FILES_LOCATION);

  const files = await readdir(dir);

  expect(files).toHaveLength(1);

  const filePath = path.join(dir, files[0]!);

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals).toMatchObject({
    FilesWithTraces: [
      {
        results: [
          {
            traces: [
              {
                output: EvaliteFile.fromPath(filePath),
              },
            ],
          },
        ],
      },
    ],
  });
});

it.todo("Should show the url in the CLI output");

it("Should let users add files to data().input and data().expected", async () => {
  const fixture = loadFixture("files");

  const captured = captureStdout();

  await runVitest({
    cwd: fixture.dir,
    path: undefined,
    testOutputWritable: captured.writable,
    mode: "run-once-and-exit",
  });

  const dir = path.join(fixture.dir, FILES_LOCATION);

  const files = await readdir(dir);

  expect(files).toHaveLength(1);

  const filePath = path.join(dir, files[0]!);

  const file = await readFile(filePath);

  expect(file).toBeTruthy();

  const db = createDatabase(fixture.dbLocation);

  const evals = await getEvalsAsRecord(db);

  expect(evals).toMatchObject({
    FilesInInput: [
      {
        results: [
          {
            input: EvaliteFile.fromPath(filePath),
            expected: EvaliteFile.fromPath(filePath),
          },
        ],
      },
    ],
  });
});
