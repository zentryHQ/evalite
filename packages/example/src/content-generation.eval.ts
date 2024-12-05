import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createScorer, evalite } from "evalite";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { cacheModel } from "./cache-model";
import { traceAISDKModel } from "evalite/ai-sdk";

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
      {
        input: 'Write a tweet about "TypeScript is a superset of JavaScript."',
      },
      {
        input: `Write an article about TypeScript's basic types, like string and number.`,
      },
    ];
  },
  task: async (input) => {
    const result = await generateText({
      model: traceAISDKModel(cacheModel(openai("gpt-4o-mini"), storage)),
      prompt: input,
      system: `
        You are a helpful social media assistant.
        You will be asked to write a tweet on a given topic.
        Return only the tweet.
        Do not use emojis.
        Do not use hashtags.
        Use code examples if needed.
      `,
    });

    return result.text;
  },
  scorers: [
    createScorer("No Hashtags", ({ output }) => {
      return output.includes("#") ? 0 : 1;
    }),
  ],
});
