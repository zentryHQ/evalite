<!-- packages/evalite/readme.md is the source of truth for this file -->

# Evalite

The TypeScript-native, open-source tool for testing LLM-powered apps.

- Fully open source: **No API Key required**
- Based on Vitest
- Supports tracing, custom scorers, and

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
- Appends the result of the eval to a `evalite-report.jsonl` file

It then:

- Shows a UI for viewing the traces, scores, inputs and outputs at http://localhost:3006.
- If you only ran one eval, it also shows a table summarizing the eval in the terminal.

### 5. View Your Eval

Open http://localhost:3006 in your browser to view the results of the eval.

## Guides

### Traces

Traces are used to track the behaviour of each individual call to an LLM inside your task.

You can report a trace by calling `reportTrace` inside an `evalite` eval:

```ts
import { evalite, type Evalite } from "evalite";
import { reportTrace } from "evalite/evals";

evalite("My Eval", {
  data: async () => {
    return [{ input: "Hello", output: "Hello World!" }];
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
      prompt: [
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
const tracedModel = traceAISDKModel(openai("gpt-3.5-turbo"));

const result = await generateText({
  model: tracedModel,
  system: `Answer the question concisely.`,
  prompt: `What is the capital of France?`,
});
```

> [!NOTE]
>
> `traceAISDKModel`, like `reportTrace`, is a no-op in production.
