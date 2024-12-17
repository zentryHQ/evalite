import { generateText } from "ai";
import { Levenshtein } from "autoevals";
import { evalite } from "evalite";

evalite("Columns", {
  data: () => {
    return [
      {
        input: {
          first: "abc",
        },
        expected: {
          last: 123,
        },
      },
    ];
  },
  task: async (input) => {
    return {
      last: 123,
    };
  },
  scorers: [],
  experimental_customColumns: async ({ input, output, expected }) => {
    return [
      {
        label: "Input First",
        value: input.first,
      },
      {
        label: "Expected Last",
        value: expected?.last,
      },
      {
        label: "Output Last",
        value: output.last,
      },
    ];
  },
});
