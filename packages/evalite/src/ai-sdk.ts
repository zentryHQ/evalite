import {
  experimental_wrapLanguageModel,
  type LanguageModelV1,
  type LanguageModelV1StreamPart,
  type LanguageModelV1CallOptions,
} from "ai";
import { reportTrace, shouldReportTrace } from "./traces.js";

const processPromptForTracing = (
  prompt: LanguageModelV1CallOptions["prompt"]
) => {
  return prompt.map((prompt) => {
    if (!Array.isArray(prompt.content)) {
      return {
        role: prompt.role,
        content: prompt.content,
      };
    }

    const content = prompt.content.map((content) => {
      if (content.type !== "text") {
        throw new Error(
          `Unsupported content type: ${content.type}. Only text is currently supported by traceAISDKModel.`
        );
      }

      return {
        type: "text" as const,
        text: content.text,
      };
    });

    return {
      role: prompt.role,
      content,
    };
  });
};

export const traceAISDKModel = (model: LanguageModelV1): LanguageModelV1 => {
  if (!shouldReportTrace()) return model;
  return experimental_wrapLanguageModel({
    model,
    middleware: {
      wrapGenerate: async (opts) => {
        const start = performance.now();
        const generated = await opts.doGenerate();
        const end = performance.now();

        reportTrace({
          output: generated.text ?? "",
          input: processPromptForTracing(opts.params.prompt),
          usage: generated.usage,
          start,
          end,
        });

        return generated;
      },
      wrapStream: async ({ doStream, params, model }) => {
        const start = performance.now();
        const { stream, ...rest } = await doStream();

        const fullResponse: LanguageModelV1StreamPart[] = [];

        const transformStream = new TransformStream<
          LanguageModelV1StreamPart,
          LanguageModelV1StreamPart
        >({
          transform(chunk, controller) {
            fullResponse.push(chunk);
            controller.enqueue(chunk);
          },
          flush() {
            const usage = fullResponse.find(
              (part) => part.type === "finish"
            )?.usage;
            reportTrace({
              start,
              end: performance.now(),
              input: processPromptForTracing(params.prompt),
              output: fullResponse,
              usage,
            });
          },
        });

        return {
          stream: stream.pipeThrough(transformStream),
          ...rest,
        };
      },
    },
  });
};
