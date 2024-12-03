import { experimental_wrapLanguageModel, type LanguageModelV1 } from "ai";
import { reportTrace, shouldReportTrace } from "./traces.js";

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
          prompt: opts.params.prompt.map((prompt) => {
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
          }),
          usage: generated.usage,
          start,
          end,
        });

        return generated;
      },
    },
  });
};
