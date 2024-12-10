# Evalite

![Evalite: the TypeScript-native, local-first tool for testing LLM-powered apps.](https://raw.githubusercontent.com/mattpocock/evalite/refs/heads/main/repo-card.jpg)

- [View the docs](./packages/evalite/readme.md)

## Contributing

1. Create a .env file inside `packages/example` containing an `OPENAI_API_KEY`:

```sh
OPENAI_API_KEY=your-api-key
```

2. Run `pnpm run dev`. This will:

- Run the TS type checker on `evalite`, `evalite-core`
- Run some tests at `evalite-tests`
- Run the UI dev server at http://localhost:5173
- Run `evalite watch` on the examples in `packages/example`

> [!IMPORTANT]
>
> You may need to run `pnpm build` in root, then `npm link` inside `packages/evalite` to get the global `evalite` command to work.
