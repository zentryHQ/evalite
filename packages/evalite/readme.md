![Evalite: the TypeScript-native, local-first tool for testing LLM-powered apps.](https://raw.githubusercontent.com/mattpocock/evalite/refs/heads/main/repo-card.jpg)

## What Is Evalite?

- Fully open source: **No API Key required**.
- Local-first: runs on your machine, your data never leaves your laptop.
- Based on [Vitest](https://vitest.dev/), the best TypeScript test runner around.
- Terminal UI for quick prototyping.
- Supports tracing and custom scorers.

## How Do I Learn More?

- [Read the Docs](https://www.evalite.dev/)
- [Join the Discord](https://www.mattpocock.com/ai-discord)

## Evalite Is Experimental

Evalite is still an experimental project. I'm actively working on it, and for now am pushing breaking changes.

If you run into any unexpected behavior:

1. Delete the `node_modules/.evalite` folder.
2. Update `evalite` to the latest version.
3. Rerun your evals.

If, after that, you run into unexpected behavior, [report an issue](https://github.com/mattpocock/evalite/issues).

## Guides

### Watch Mode

You can run Evalite in watch mode by running `evalite watch`:

```bash
evalite watch
```

This will watch for changes to your `.eval.ts` files and re-run the evals when they change.

> [!IMPORTANT]
>
> I strongly recommend implementing a caching layer in your LLM calls when using watch mode. This will keep your evals running fast and avoid burning through your API credits.

### Running Specific Files

You can run specific files by passing them as arguments:

```bash
evalite my-eval.eval.ts
```

This also works for `watch` mode:

```bash
evalite watch my-eval.eval.ts
```
