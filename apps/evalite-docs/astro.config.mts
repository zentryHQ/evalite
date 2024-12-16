import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Evalite",
      favicon: "/favicon.ico",
      editLink: {
        baseUrl:
          "https://github.com/mattpocock/evalite/edit/main/apps/evalite-docs",
      },
      social: {
        github: "https://github.com/mattpocock/evalite",
        discord: "https://mattpocock.com/ai-discord",
      },
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              label: "What Is Evalite?",
              slug: "what-is-evalite",
            },
            {
              label: "Quickstart",
              slug: "quickstart",
            },
          ],
        },
        {
          label: "Guides",
          items: [
            {
              label: "Environment Variables",
              slug: "guides/environment-variables",
            },
            {
              label: "Scorers",
              slug: "guides/scorers",
            },
            {
              label: "Traces",
              slug: "guides/traces",
            },
            {
              label: "Streams",
              slug: "guides/streams",
            },
          ],
        },
        {
          label: "Examples",
          items: [{ label: "AI SDK", slug: "examples/ai-sdk" }],
        },
      ],
    }),
  ],
});
