import { evalite, createScorer } from "evalite";
import { Levenshtein } from "autoevals";
import { setTimeout } from "node:timers/promises";

evalite("Index", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: async (input) => {
    // To test whether duration is calculated properly
    await setTimeout(10);
    return input + "def";
  },
  scorers: [
    createScorer("Is Same", ({ output, expected }) => {
      return output === expected ? 1 : 0;
    }),
  ],
});
