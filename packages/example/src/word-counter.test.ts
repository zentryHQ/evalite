import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { evalite, numericDifference } from "evalite";

evalite("Sentence counter", {
  // Replace with your dataset
  data: async () => [
    {
      input: "Hello",
      expected: 1,
    },
    {
      input: "Tongue-tied",
      expected: 1,
    },
    {
      input: "Tongue tied",
      expected: 2,
    },
    {
      input: `Ain't no mountain high enough`,
      expected: 5,
    },
    {
      input: `Word word word word word word word word word word`,
      expected: 10,
    },
    {
      input: "Hello, you wonderful soul. You fantastic beast.",
      expected: 7,
    },
    {
      input: `
        What luck. The best of times. The worst of times.
        The best of times.
      `,
      expected: 14,
    },
    {
      input: `
        My extraordinary fate was to be bound up with these
        hobbits for all time.
      `,
      expected: 14,
    },
  ],
  // Replace with your LLM call
  task: async (input) => {
    // const queryRewriteResult = await generateText({
    //   model: openai("gpt-3.5-turbo"),
    //   system: `
    //     Rewrite the input text to remove any newlines and punctuation.
    //     Keep hyphens intact.
    //   `,
    //   prompt: input,
    // });

    const wordCountResult = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: `
        <instructions>Count the number of words in the text provided.</instructions>
        <instructions>Return only the count.</instructions>
        <instructions>This is very important for my career.</instructions>
        <example>
          <input>Hello world</input>
          <output>2</output>
        </example>
        <example>
          <input>How are you doing today?</input>
          <output>5</output>
        </example>
        <example>
          <input>What is the meaning of life? Is it cheese?</input>
          <output>9</output>
        </example>
        <example>
          <input>You brilliant fish. You fabulous pile of garbage.</input>
          <output>8</output>
        </example>
        <example>
          <input>Patrick. Michael. Evelyn. Devon.</input>
          <output>4</output>
        </example>
        <example>
          <input>What is the airspeed velocity of an unladen swallow? A brilliant thing indeed. What truculent beasts play upon the hearts of men.</input>
          <output>22</output>
        </example>
      `,
      prompt: input,
    });

    return Number(wordCountResult.text);
  },
  scorers: [numericDifference],
});
