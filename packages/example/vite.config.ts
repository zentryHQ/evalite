import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["evalite-vitest/reporter"],
    setupFiles: ["dotenv/config"],
  },
});
