import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { evalite } from "evalite";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { Factuality, Levenshtein } from "autoevals";
import { cacheModel } from "./cache-model.js";
import { traceAISDKModel } from "evalite/ai-sdk";

const storage = createStorage({
  driver: (fsDriver as any)({
    base: "./llm-cache.local",
  }),
});

evalite("Failure", {
  data: async () => [
    {
      input: "X",
    },
  ],
  task: async (input) => {
    throw new Error("It failed!");
  },
  scorers: [Factuality, Levenshtein],
});
