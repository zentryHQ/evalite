import { evalite, Levenshtein } from "evalite-vitest";

evalite("Testing my LLM awesomeness", {
  // Replace with your dataset
  data: async () => [
    {
      input: "Hello",
      expected: "Hello World",
    },
    {
      input: "Hello Mr",
      expected: "Hello Mr World!!",
    },
  ],
  // Replace with your LLM call
  task: async (input) => {
    return input + " World";
  },
  scores: [Levenshtein],
});
