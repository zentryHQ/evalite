import { createScorer, evalite } from "evalite";

evalite("Test Objects", {
  data: async () => {
    return [
      {
        input: {
          a: "Some extremely long string that is an issue for our system",
          b: 2,
          c: 3,
          d: 4,
        },
        expected: {
          a: "Some extremely long string that is an issue for our system",
          b: 2,
          c: 3,
        },
      },
    ];
  },
  task: async (input: any) => {
    const immutableInput = { ...input };
    delete immutableInput.d;
    return immutableInput;
  },
  scorers: [
    createScorer<object>("Deep Equals Object", ({ output, expected }) => {
      return JSON.stringify(output) === JSON.stringify(expected) ? 1 : 0;
    }),
  ],
});
