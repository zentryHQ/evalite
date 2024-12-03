import { evalite } from "../../../index.js";
import { reportTrace } from "../../../traces.js";
import { Levenshtein } from "autoevals";

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
