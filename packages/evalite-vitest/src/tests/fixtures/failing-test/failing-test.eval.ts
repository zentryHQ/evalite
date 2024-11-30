import { evalite, Levenshtein } from "../../../index.js";

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
