import { evalite } from "evalite";
import { Levenshtein } from "autoevals";
import { setTimeout } from "node:timers/promises";
import { createReadStream } from "node:fs";
import path from "node:path";

evalite("Stream", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: async (input) => {
    const arr = ["a", "b", "c", "d", "e", "f"];

    const stream = ReadableStream.from(arr);

    return stream;
  },
  scorers: [Levenshtein],
});
