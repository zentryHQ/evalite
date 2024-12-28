import { evalite } from "evalite";
import { reportTrace } from "evalite/traces";
import { readFileSync } from "node:fs";
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
    return readFileSync(path.join(import.meta.dirname, "test.png"));
  },
  scorers: [],
});

evalite("FilesInInput", {
  data: () => {
    return [
      {
        input: readFileSync(path.join(import.meta.dirname, "test.png")),
        expected: readFileSync(path.join(import.meta.dirname, "test.png")),
      },
    ];
  },
  task: async (input) => {
    return "abc" as any;
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
      output: readFileSync(path.join(import.meta.dirname, "test.png")),
    });
    return input + "def";
  },
  scorers: [],
});
