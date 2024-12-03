# Evalite

The TypeScript-native, open-source tool for testing LLM-powered apps.

- Fully open source: **No API Key required**
- Based on Vitest
- Supports

## Quickstart

### 1. Install `evalite` and `autoevals`:

Install `evalite`, and a scoring library like `autoevals`:

```bash
pnpm add -D evalite autoevals
```

### 2. Add an `eval` script:

Add an `eval` script to your package.json:

```json
{
  "scripts": {
    "eval": "evalite"
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
    return [{ input: "Hello", output: "Hello World!" }];
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

Run `pnpm run eval`.

This runs `evalite`, which runs the evals:

- Runs the `data` function to get the test data
- Runs the `task` function on each test data
- Scores the output of the `task` function using the `scorers`

It then produces:

- A report of the
- If you only ran one eval, it also shows table summarizing the eval in the terminal

##

I want a simple test runner that can:

-Run my evals on a watch script
-Show me a UI for viewing traces, scores, inputs and outputs
-Not need me to sign up for an API key

So, I'm building one.

It's based on Vitest, and it's called Evalite.

Here's an [early preview](https://www.aihero.dev/evalite-an-early-preview).
