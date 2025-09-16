import { defineConfig } from "evalite/config";

export default defineConfig({
  port: 3008,
  host: "localhost",
  apiBaseUrl: "http://localhost:3008",
  wsBaseUrl: "ws://localhost:3008",
});
