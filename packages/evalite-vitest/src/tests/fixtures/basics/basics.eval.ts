import { evalite, Levenshtein } from "../../../index.js";

evalite("Basics", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: (input) => {
    return input + "def";
  },
  scorers: [Levenshtein],
});
