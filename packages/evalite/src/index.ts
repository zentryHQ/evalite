import { FILES_LOCATION, type Evalite } from "@evalite/core";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { describe, inject, it } from "vitest";
import { reportTraceLocalStorage } from "./traces.js";
import { writeFileQueueLocalStorage } from "./write-file-queue-local-storage.js";
import { createEvaliteFileIfNeeded } from "./utils.js";

declare module "vitest" {
  interface TaskMeta {
    evalite?: Evalite.TaskMeta;
  }
}

const joinArrayOfUnknownResults = (results: unknown[]): unknown => {
  return results.reduce((acc, result) => {
    if (
      typeof result === "string" ||
      typeof result === "number" ||
      typeof result === "boolean"
    ) {
      return `${acc}${result}`;
    }
    throw new Error(
      `Cannot display results of stream: stream contains non-string, non-number, non-boolean chunks.`
    );
  }, "");
};

const executeTask = async <TInput, TOutput>(
  task: Evalite.Task<TInput, TOutput>,
  input: TInput
): Promise<TOutput> => {
  const taskResultOrStream = await task(input);

  if (
    typeof taskResultOrStream === "object" &&
    taskResultOrStream &&
    Symbol.asyncIterator in taskResultOrStream
  ) {
    const chunks: TOutput[] = [];

    for await (const chunk of taskResultOrStream) {
      chunks.push(chunk);
    }

    return joinArrayOfUnknownResults(chunks) as TOutput;
  }

  return taskResultOrStream;
};

const runTask = async <TInput, TOutput, TExpected>(
  opts: {
    input: TInput;
    expected: TExpected | undefined;
  } & Omit<Evalite.RunnerOpts<TInput, TOutput, TExpected>, "data">
) => {
  const start = performance.now();
  const output = await executeTask(opts.task, opts.input);
  const duration = Math.round(performance.now() - start);

  const experimental_columns =
    (await opts.experimental_customColumns?.({
      input: opts.input,
      output,
      expected: opts.expected,
    })) || [];

  const scores = await Promise.all(
    opts.scorers.map(async (scorerOrOpts) => {
      if (typeof scorerOrOpts === "function") {
        return scorerOrOpts({
          input: opts.input,
          output,
          expected: opts.expected,
        });
      } else {
        return createScorer(scorerOrOpts)({
          input: opts.input,
          output,
          expected: opts.expected,
        });
      }
    })
  );

  return {
    output,
    scores,
    duration,
    experimental_columns,
  };
};

export const evalite = <TInput, TOutput, TExpected>(
  evalName: string,
  opts: Evalite.RunnerOpts<TInput, TOutput, TExpected>
) => registerEvalite(evalName, opts);

evalite.experimental_skip = <TInput, TOutput, TExpected>(
  evalName: string,
  opts: Evalite.RunnerOpts<TInput, TOutput, TExpected>
) => registerEvalite(evalName, opts, { modifier: "skip" });

function registerEvalite<TInput, TOutput, TExpected>(
  evalName: string,
  opts: Evalite.RunnerOpts<TInput, TOutput, TExpected>,
  vitestOpts: { modifier?: "only" | "skip" } = {}
) {
  const describeFn = vitestOpts.modifier === "skip" ? describe.skip : describe;
  const datasetPromise =
    vitestOpts.modifier === "skip" ? Promise.resolve([]) : opts.data();

  return describeFn(evalName, async () => {
    const dataset = await datasetPromise;
    it.concurrent.for(dataset.map((d, index) => ({ ...d, index })))(
      evalName,
      async (data, { task }) => {
        const cwd = inject("cwd");

        const rootDir = path.join(cwd, FILES_LOCATION);

        task.meta.evalite = {
          duration: undefined,
          initialResult: {
            evalName: evalName,
            filepath: task.file.filepath,
            order: data.index,
          },
        };

        const start = performance.now();

        const filePromises: Promise<void>[] = [];

        writeFileQueueLocalStorage.enterWith(async (filePath, buffer) => {
          const func = async () => {
            await mkdir(path.dirname(filePath), { recursive: true });
            await writeFile(filePath, buffer);
          };

          const promise = func();

          filePromises.push(promise);
        });

        const traces: Evalite.Trace[] = [];
        reportTraceLocalStorage.enterWith((trace) => traces.push(trace));

        const [input, expected] = await Promise.all([
          createEvaliteFileIfNeeded({ rootDir, input: data.input }),
          createEvaliteFileIfNeeded({ rootDir, input: data.expected }),
        ]);

        try {
          const { output, scores, duration, experimental_columns } =
            await runTask({
              expected: data.expected,
              input: data.input,
              scorers: opts.scorers,
              task: opts.task,
              experimental_customColumns: opts.experimental_customColumns,
            });

          const [outputWithFiles, tracesWithFiles, renderedColumns] =
            await Promise.all([
              createEvaliteFileIfNeeded({
                rootDir,
                input: output,
              }),
              handleFilesInTraces(rootDir, traces),
              handleFilesInColumns(rootDir, experimental_columns),
            ]);

          task.meta.evalite = {
            result: {
              evalName: evalName,
              filepath: task.file.filepath,
              order: data.index,
              duration,
              expected: expected,
              input: input,
              output: outputWithFiles,
              scores,
              traces: tracesWithFiles,
              status: "success",
              renderedColumns,
            },
            duration: Math.round(performance.now() - start),
          };
        } catch (e) {
          task.meta.evalite = {
            result: {
              evalName: evalName,
              filepath: task.file.filepath,
              order: data.index,
              duration: Math.round(performance.now() - start),
              expected: expected,
              input: input,
              output: e,
              scores: [],
              traces: await handleFilesInTraces(rootDir, traces),
              status: "fail",
              renderedColumns: [],
            },
            duration: Math.round(performance.now() - start),
          };
          throw e;
        }

        await Promise.all(filePromises);
      }
    );
  });
}

export const createScorer = <TInput, TOutput, TExpected>(
  opts: Evalite.ScorerOpts<TInput, TOutput, TExpected>
): Evalite.Scorer<TInput, TOutput, TExpected> => {
  return async (input: Evalite.ScoreInput<TInput, TOutput, TExpected>) => {
    const score = await opts.scorer(input);

    if (typeof score === "object") {
      if (typeof score.score !== "number") {
        throw new Error(`The scorer '${opts.name}' must return a number.`);
      }

      return {
        score: score.score,
        metadata: score.metadata,
        description: opts.description,
        name: opts.name,
      };
    }

    if (typeof score !== "number") {
      throw new Error(`The scorer '${opts.name}' must return a number.`);
    }
    return {
      description: opts.description,
      name: opts.name,
      score,
    };
  };
};

export * from "./evalite-file.js";

const handleFilesInColumns = async (
  rootDir: string,
  columns: Evalite.RenderedColumn[]
) => {
  return await Promise.all(
    columns.map(async (column) => {
      const file = await createEvaliteFileIfNeeded({
        rootDir,
        input: column.value,
      });
      return {
        ...column,
        value: file,
      };
    })
  );
};

const handleFilesInTraces = async (
  rootDir: string,
  traces: Evalite.Trace[]
) => {
  return await Promise.all(
    traces.map(async (trace) => {
      const [input, output] = await Promise.all([
        createEvaliteFileIfNeeded({
          rootDir,
          input: trace.input,
        }),
        createEvaliteFileIfNeeded({
          rootDir,
          input: trace.output,
        }),
      ]);
      return {
        ...trace,
        input,
        output,
      };
    })
  );
};

export type { Evalite };
