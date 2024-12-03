import { generateText } from "ai";
import { MockLanguageModelV1 } from "ai/test";
import { traceAISDKModel } from "evalite/ai-sdk";
import { evalite } from "evalite";
import { Levenshtein } from "autoevals";

const model = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`,
  }),
});

const tracedModel = traceAISDKModel(model);

evalite("AI SDK Traces", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: async (input) => {
    const result = await generateText({
      model: tracedModel,
      system: "Test system",
      prompt: input,
    });
    return result.text;
  },
  scorers: [Levenshtein],
});
