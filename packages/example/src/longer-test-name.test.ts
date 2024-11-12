import { evalite, Levenshtein } from "evalite-vitest";

evalite("Testing my LLM awesomeness", {
  data: async () => [
    {
      input: "Hello",
      expected: "Hello World",
    },
    {
      input: "Hello Mr",
      expected: "Hello Mr Awesome!!",
    },
  ],
  task: async (input) => {
    return input + " World";
  },
  scores: [Levenshtein],
});
