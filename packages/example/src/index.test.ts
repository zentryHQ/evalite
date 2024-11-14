import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { evalite, Levenshtein } from "evalite-vitest";

evalite("Add 'world' to end of phrase", {
  // Replace with your dataset
  data: async () => [
    {
      input: "Hello",
      expected: "Hello World",
    },
    {
      input: "Hello Mr",
      expected: "Hello Mr World",
    },
    {
      input: "World",
      expected: "World World",
    },
    {
      input: "World World World World",
      expected: "World World World World World",
    },
    {
      input: "",
      expected: "World",
    },
  ],
  // Replace with your LLM call
  task: async (input) => {
    const result = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: `
        <instructions>Add "World" to the end of the input.</instructions>
        <instructions>When an empty prompt is encountered, return "World".</instructions>
        <example>
          <input>Interesting</input>
          <output>Interesting World</output>
        </example>
        <example>
          <input>World</input>
          <output>World World</output>
        </example>
        <example>
          <input></input>
          <output>World</output>
        </example>
        <example>
          <input>This is the best place in the</input>
          <output>This is the best place in the World</output>
        </example>
      `,
      prompt: input,
    });

    return result.text;
  },
  scorers: [Levenshtein],
});
