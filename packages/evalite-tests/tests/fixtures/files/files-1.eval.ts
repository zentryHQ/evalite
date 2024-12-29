import { evalite } from "evalite";
import { reportTrace } from "evalite/traces";
import { readFileSync } from "node:fs";
import path from "node:path";

evalite("Files", {
  data: () => {
    return [
      {
        input: "abc",
      },
    ];
  },
  task: async (input) => {
    return readFileSync(path.join(import.meta.dirname, "test.png"));
  },
  scorers: [],
});
