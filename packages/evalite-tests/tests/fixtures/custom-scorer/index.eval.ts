import { createScorer, evalite } from "evalite";
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
    createScorer({
      name: "Is Same",
      scorer: ({ output, expected }) => {
        return output === expected ? 1 : 0;
      },
    }),
  ],
});
