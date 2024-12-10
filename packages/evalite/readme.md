# Evalite

![Evalite: the TypeScript-native, local-first tool for testing LLM-powered apps.](https://raw.githubusercontent.com/mattpocock/evalite/refs/heads/main/repo-card.jpg)

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

### Environment Variables

To call your LLM from a third-party service, you'll likely need some environment variables to keep your API keys safe.

Since Evalite is based on Vitest, it should already pick them up from your `vite.config.ts`.

If you don't have Vitest set up, here's how to do it:

1. Create a `.env` file in the root of your project:

```
OPENAI_API_KEY=your-api-key
```

2. Add `.env` to your `.gitignore`, if it's not already there

```
.env
```

3. Install `dotenv`:

```bash
pnpm add -D dotenv
```

4. Add a `vite.config.ts` file:

```ts
// vite.config.ts

import { defineConfig } from "vite/config";

export default defineConfig({
  test: {
    setupFiles: ["dotenv/config"],
  },
});
```

Now, your environment variables will be available in your evals.

### Scorers

Scorers are used to score the output of your LLM call.

[Autoevals](https://github.com/braintrustdata/autoevals) is a great library of scorers to get you started.

You can create your own using `createScorer`:

```ts
import { createScorer } from "evalite";

const containsParis = createScorer<string>({
  name: "Contains Paris",
  description: "Checks if the output contains the word 'Paris'.",
  score: (output) => {
    return output.includes("Paris") ? 1 : 0;
  },
});

evalite("My Eval", {
  data: async () => {
    return [{ input: "Hello", output: "Hello World!" }];
  },
  task: async (input) => {
    return input + " World!";
  },
  scorers: [containsParis],
});
```

#### Metadata

You can provide metadata along with your custom scorer:

```ts
import { createScorer } from "evalite";

const containsParis = createScorer<string>({
  name: "Contains Paris",
  description: "Checks if the output contains the word 'Paris'.",
  score: (output) => {
    return {
      score: output.includes("Paris") ? 1 : 0,
      metadata: {
        // Can be anything!
      },
    };
  },
});
```

This will be visible along with the score in the Evalite UI.

> [!TIP]
>
> This is especially useful for debugging LLM-as-a-judge evals. In autoevals `Factuality` scorer, the metadata will include a rationale for why the scorer gave the score it did.

### Traces

Traces are used to track the behaviour of each individual call to an LLM inside your task.

You can report a trace by calling `reportTrace` inside an `evalite` eval:

```ts
import { evalite, type Evalite } from "evalite";
import { reportTrace } from "evalite/evals";

evalite("My Eval", {
  data: async () => {
    return [{ input: "Hello", expected: "Hello World!" }];
  },
  task: async (input) => {
    // Track the start time
    const start = performance.now();

    // Call our LLM
    const result = await myLLMCall();

    // Report the trace once it's finished
    reportTrace({
      start,
      end: performance.now(),
      output: result.output,
      input: [
        {
          role: "user",
          content: input,
        },
      ],
      usage: {
        completionTokens: result.completionTokens,
        promptTokens: result.promptTokens,
      },
    });

    // Return the output
    return result.output;
  },
  scorers: [Levenshtein],
});
```

> [!NOTE]
>
> `reportTrace` is a no-op in production, so you can leave it in your code without worrying about performance.

#### Reporting Traces Automatically

If you're using the [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction), you can automatically report traces by wrapping your model in `traceAISDKModel` function:

```ts
import { traceAISDKModel } from "evalite/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// All calls to this model will be recorded in evalite!
const tracedModel = traceAISDKModel(openai("gpt-4o-mini"));

const result = await generateText({
  model: tracedModel,
  system: `Answer the question concisely.`,
  prompt: `What is the capital of France?`,
});
```

> [!NOTE]
>
> `traceAISDKModel`, like `reportTrace`, is a no-op in production.

### Streams

You can handle streams in Evalite by returning any async iterable (including a `ReadableStream`) from your task. This means you can test functions like the AI SDK `streamText` function easily:

```ts
import { evalite } from "evalite";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Factuality } from "autoevals";

evalite("My Eval", {
  data: async () => {
    return [{ input: "What is the capital of France?", expected: "Paris" }];
  },
  task: async (input) => {
    const result = await streamText({
      model: openai("your-model"),
      system: `Answer the question concisely.`,
      prompt: input,
    });

    return result.textStream;
  },
  scorers: [Factuality],
});
```
