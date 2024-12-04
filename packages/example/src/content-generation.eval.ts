import { generateText } from "ai";
import { createScorer, evalite } from "evalite";
import { cacheModel } from "./cache-model";
import { openai } from "@ai-sdk/openai";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { Humor } from "autoevals";

const storage = createStorage({
  driver: (fsDriver as any)({
    base: "./llm-cache.local",
  }),
});

evalite("Content generation", {
  data: async () => {
    return [
      {
        input: "Write a TypeScript tweet",
      },
      {
        input: "Write a tweet about TypeScript template literal types.",
      },
    ];
  },
  task: async (input) => {
    const result = await generateText({
      model: cacheModel(openai("gpt-4o-mini"), storage),
      prompt: input,
      system: `
        You are a helpful social media assistant.
        You will be asked to write a tweet on a given topic.
        Return only the tweet.
        Do not use emojis.
        Do not use hashtags.
        Use code examples where required.
      `,
    });

    return result.text;
  },
  scorers: [
    Humor,
    createScorer("No Hashtags", ({ output }) => {
      return output.includes("#") ? 0 : 1;
    }),
  ],
});
