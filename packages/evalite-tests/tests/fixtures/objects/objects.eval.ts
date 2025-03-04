import { createScorer, evalite } from "evalite";

type Shape = {
  input: string;
  output: number | undefined;
};

evalite<Shape[], Shape[], Shape[]>("Basics", {
  data: () => {
    return [
      {
        input: [
          {
            input: "abc",
            output: undefined,
          },
        ],
        expected: [
          {
            input: "abc",
            output: 123,
          },
        ],
      },
    ];
  },
  task: async (input) => {
    input.push({
      input: "abc",
      output: 123,
    });

    return input;
  },
  scorers: [
    createScorer({
      name: "Exact Match",
      scorer: ({ output, expected }) => {
        return JSON.stringify(output) === JSON.stringify(expected) ? 1 : 0;
      },
    }),
  ],
});
