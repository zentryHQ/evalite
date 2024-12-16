![Evalite: the TypeScript-native, local-first tool for testing LLM-powered apps.](https://raw.githubusercontent.com/mattpocock/evalite/refs/heads/main/repo-card.jpg)

- [Join the Discord](https://www.mattpocock.com/ai-discord)

## What Is Evalite?

- Fully open source: **No API Key required**.
- Local-first: runs on your machine, your data never leaves your laptop.
- Based on [Vitest](https://vitest.dev/), the best TypeScript test runner around.
- Terminal UI for quick prototyping.
- Supports tracing and custom scorers.

## Quickstart

### 1. Install `evalite` and `autoevals`:

Install `evalite`, `vitest`, and a scoring library like `autoevals`:

```bash
pnpm add -D evalite vitest autoevals
```

### 2. Add an `eval:dev` script:

Add an `eval` script to your package.json:

```json
{
  "scripts": {
    "eval:dev": "evalite watch"
  }
}
```

### 3. Create your first eval:

Create `my-eval.eval.ts`:

```ts
// my-eval.eval.ts

import { evalite } from "evalite";
import { Levenshtein } from "autoevals";

evalite("My Eval", {
  // A function that returns an array of test data
  // - TODO: Replace with your test data
  data: async () => {
    return [{ input: "Hello", expected: "Hello World!" }];
  },
  // The task to perform
  // - TODO: Replace with your LLM call
  task: async (input) => {
    return input + " World!";
  },
  // The scoring methods for the eval
  scorers: [Levenshtein],
});
```

> [!NOTE]
>
> `.eval.ts` is the extension Evalite looks for when scanning for evals.

### 4. Run Your Eval

Run `pnpm run eval:dev`.

This runs `evalite`, which runs the evals:

- Runs the `data` function to get the test data
- Runs the `task` function on each test data
- Scores the output of the `task` function using the `scorers`
- Saves the results to a sqlite database in `node_modules/.evalite`

It then:

- Shows a UI for viewing the traces, scores, inputs and outputs at http://localhost:3006.
- If you only ran one eval, it also shows a table summarizing the eval in the terminal.

### 5. View Your Eval

Open http://localhost:3006 in your browser to view the results of the eval.

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
