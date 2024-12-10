import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { setTimeout } from "timers/promises";

evalite("Long", {
  data: async () => [
    {
      input: `What's the capital of France?`,
      expected: `Paris`,
    },
  ],
  task: async (input) => {
    await setTimeout(6000);
    return "Paris";
  },
  scorers: [Factuality, Levenshtein],
});
