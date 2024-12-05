import { Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { reportTrace } from "evalite/traces";
import { setTimeout } from "node:timers/promises";

evalite("Traces", {
  data: async () => {
    return [{ input: "abc", expected: "abcdef" }];
  },
  task: async (input) => {
    const start = performance.now();
    await setTimeout(500);
    reportTrace({
      start,
      end: performance.now(),
      output: "abcd",
      input,
    });
    const start2 = performance.now();
    await setTimeout(600);
    reportTrace({
      start: start2,
      end: performance.now(),
      output: "abcde",
      input,
    });

    const start3 = performance.now();
    await setTimeout(700);
    reportTrace({
      start: start3,
      end: performance.now(),
      output: "abcdef",
      input,
    });

    return "abcdef";
  },
  scorers: [Levenshtein],
});
