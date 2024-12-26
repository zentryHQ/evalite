import { streamText } from "ai";
import { MockLanguageModelV1, simulateReadableStream } from "ai/test";
import { Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { traceAISDKModel } from "evalite/ai-sdk";

const model = new MockLanguageModelV1({
  doStream: async () => ({
    stream: simulateReadableStream({
      chunks: [
        { type: "text-delta", textDelta: "Hello" },
        { type: "text-delta", textDelta: ", " },
        { type: "text-delta", textDelta: `world!` },
        {
          type: "finish",
          finishReason: "stop",
          logprobs: undefined,
          usage: { completionTokens: 10, promptTokens: 3 },
        },
      ],
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
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
    const result = await streamText({
      model: tracedModel,
      system: "Test system",
      prompt: input,
    });
    return result.textStream;
  },
  scorers: [Levenshtein],
});
