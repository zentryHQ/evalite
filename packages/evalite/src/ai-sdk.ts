import {
  experimental_wrapLanguageModel,
  type LanguageModelV1,
  type LanguageModelV1StreamPart,
  type LanguageModelV1CallOptions,
} from "ai";
import { reportTrace, shouldReportTrace } from "./traces.js";

const handlePromptContent = (
  content: LanguageModelV1CallOptions["prompt"][number]["content"][number]
): unknown => {
  if (typeof content === "string") {
    return {
      type: "text" as const,
      text: content,
    };
  }
  if (content.type === "text") {
    return {
      type: "text" as const,
      text: content.text,
    };
  }

  if (content.type === "tool-call") {
    return {
      type: "tool-call" as const,
      toolName: content.toolName,
      args: content.args,
      toolCallId: content.toolCallId,
    };
  }

  if (content.type === "tool-result") {
    return {
      type: "tool-result" as const,
      toolCallId: content.toolCallId,
      result: content.result,
      toolName: content.toolName,
      isError: content.isError,
      content: content.content?.map((content) => {
        if (content.type === "text") {
          return {
            type: "text" as const,
            text: content.text,
          };
        }

        if (content.type === "image") {
          throw new Error(
            `Unsupported content type: ${content.type}. Not supported yet.`
          );
        }
      }),
    };
  }

  // Unsupported content types are image and file
  content.type satisfies "image" | "file";

  throw new Error(
    `Unsupported content type: ${content.type}. Not supported yet.`
  );
};

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

    const content = prompt.content.map(handlePromptContent);

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
          output: {
            text: generated.text ?? "",
            toolCalls: generated.toolCalls,
          },
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
