import { evalite, Levenshtein, reportTrace } from "../../../index.js";
import { setTimeout } from "node:timers/promises";

evalite("Traces", {
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
      duration: 100,
      start: 0,
      end: 100,
      output: "abcdef",
      prompt: [
        {
          role: "input",
          content: "abc",
        },
      ],
      usage: {
        completionTokens: 1,
        promptTokens: 1,
      },
    });
    return input + "def";
  },
  scorers: [Levenshtein],
});
