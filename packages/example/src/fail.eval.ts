import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";

evalite("Failure", {
  data: async () => [
    {
      input: "X",
    },
  ],
  task: async (input) => {
    throw new Error("It failed!");
  },
  scorers: [],
});
