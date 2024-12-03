import { evalite } from "evalite";
import { Levenshtein } from "autoevals";

evalite("Failing", {
  data: () => {
    return [
      {
        input: "abc",
      },
    ];
  },
  task: (input) => {
    throw new Error("This is a failing test");
  },
  scorers: [Levenshtein],
});
