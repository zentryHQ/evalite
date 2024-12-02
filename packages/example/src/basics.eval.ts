import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { evalite, Levenshtein } from "evalite";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { cacheLanguageModel } from "./cacheLanguageModel.js";

const storage = createStorage({
  driver: (fsDriver as any)({
    base: "./llm-cache.local",
  }),
});

evalite("Test basics", {
  data: async () => [
    {
      input: `What's the capital of France?`,
      expected: `Paris.`,
    },
    {
      input: `What's the capital of Germany?`,
      expected: `Berlin.`,
    },
    {
      input: `What's the capital of Italy?`,
      expected: `Rome.`,
    },
    {
      input: `What's the capital of the United States?`,
      expected: `Washington, D.C.`,
    },
    {
      input: `What's the capital of Canada?`,
      expected: `Ottawa.`,
    },
  ],
  task: async (input) => {
    const result = await generateText({
      model: cacheLanguageModel(openai("gpt-3.5-turbo"), storage),
      system: `
        Answer the question concisely, in as few words as possible.
      `,
      prompt: input,
    });

    return result.text;
  },
  scorers: [Levenshtein],
});
