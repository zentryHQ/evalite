import { evalite, EvaliteFile } from "evalite";
import { Levenshtein } from "autoevals";
import { setTimeout } from "node:timers/promises";
import { readFileSync } from "node:fs";
import { reportTrace } from "evalite/traces";
import path from "node:path";

evalite("Files", {
  data: () => {
    return [
      {
        input: "abc",
      },
    ];
  },
  task: async (input) => {
    return EvaliteFile.fromBuffer(
      readFileSync(path.join(import.meta.dirname, "test.png")),
      "png"
    );
  },
  scorers: [],
});

evalite("FilesWithTraces", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: async (input) => {
    reportTrace({
      start: 0,
      end: 3,
      input: "abc",
      output: EvaliteFile.fromBuffer(
        readFileSync(path.join(import.meta.dirname, "test.png")),
        "png"
      ),
    });
    return input + "def";
  },
  scorers: [],
});
