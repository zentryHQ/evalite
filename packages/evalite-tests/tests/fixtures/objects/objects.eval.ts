import { createScorer, evalite } from "evalite";
import { Levenshtein } from "autoevals";
import { setTimeout } from "node:timers/promises";

evalite<{ input: string; output?: number }[]>("Basics", {
  data: () => {
    return [
      {
        input: [
          {
            input: "abc",
          },
        ],
        expected: [
          {
            input: "abc",
            output: 123,
          },
        ],
      },
    ];
  },
  task: async (input) => {
    input.push({
      input: "abc",
      output: 123,
    });

    return input;
  },
  scorers: [
    createScorer({
      name: "Exact Match",
      scorer: ({ output, expected }) => {
        return JSON.stringify(output) === JSON.stringify(expected) ? 1 : 0;
      },
    }),
  ],
});
