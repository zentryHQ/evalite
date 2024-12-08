import type * as BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";
import type { Evalite } from "./index.js";

export type SQLiteDatabase = BetterSqlite3.Database;

export const createDatabase = (url: string): BetterSqlite3.Database => {
  const db: BetterSqlite3.Database = new Database(url);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      runType TEXT NOT NULL, -- full, partial
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      filepath TEXT NOT NULL,
      duration INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES runs(id)
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eval_id INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      input TEXT NOT NULL, -- JSON
      output TEXT NOT NULL, -- JSON
      expected TEXT, -- JSON
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eval_id) REFERENCES evals(id)
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      score FLOAT NOT NULL,
      description TEXT,
      metadata TEXT, -- JSON
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (result_id) REFERENCES results(id)
    );

    CREATE TABLE IF NOT EXISTS traces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_id INTEGER NOT NULL,
      input TEXT NOT NULL, -- JSON
      output TEXT NOT NULL, -- JSON
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      FOREIGN KEY (result_id) REFERENCES results(id)
    );
  `);

  return db;
};

export declare namespace Db {
  export type Run = {
    id: number;
    runType: "full" | "partial";
    created_at: string;
  };

  export type Eval = {
    id: number;
    run_id: number;
    name: string;
    filepath: string;
    duration: number;
    created_at: string;
  };

  export type Result = {
    id: number;
    eval_id: number;
    duration: number;
    input: string;
    output: string;
    expected?: string;
    created_at: string;
  };

  export type Score = {
    id: number;
    result_id: number;
    name: string;
    score: number;
    description?: string;
    metadata?: string;
    created_at: string;
  };

  export type Trace = {
    id: number;
    result_id: number;
    input: string;
    output: string;
    start_time: number;
    end_time: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export const saveRun = (
  db: BetterSqlite3.Database,
  {
    files,
    runType,
  }: {
    runType: "full" | "partial";
    files: {
      name: string;
      filepath: string;
      tasks: {
        name: string;
        meta: {
          evalite?: Evalite.TaskMeta;
        };
      }[];
    }[];
  }
) => {
  const runId = db
    .prepare(
      `
        INSERT INTO runs (runType)
        VALUES (@runType)
      `
    )
    .run({ runType }).lastInsertRowid;

  for (const file of files) {
    for (const task of file.tasks) {
      const evalId = db
        .prepare(
          `
          INSERT INTO evals (run_id, name, filepath, duration)
          VALUES (@runId, @name, @filepath, @duration)
        `
        )
        .run({
          runId,
          name: task.name,
          filepath: file.filepath,
          duration: task.meta.evalite?.duration ?? 0,
        }).lastInsertRowid;

      if (task.meta.evalite) {
        for (const { input, output, scores, duration, expected, traces } of task
          .meta.evalite.results) {
          const resultId = db
            .prepare(
              `
              INSERT INTO results (eval_id, duration, input, output, expected)
              VALUES (@evalId, @duration, @input, @output, @expected)
            `
            )
            .run({
              evalId,
              duration,
              input: JSON.stringify(input),
              output: JSON.stringify(output),
              expected: JSON.stringify(expected),
            }).lastInsertRowid;

          for (const score of scores) {
            db.prepare(
              `
                INSERT INTO scores (result_id, name, score, description, metadata)
                VALUES (@resultId, @name, @score, @description, @metadata)
              `
            ).run({
              resultId,
              name: score.name,
              score: score.score ?? 0,
              description: score.description,
              metadata: JSON.stringify(score.metadata),
            });
          }

          for (const trace of traces) {
            db.prepare(
              `
                INSERT INTO traces (result_id, input, output, start_time, end_time, prompt_tokens, completion_tokens)
                VALUES (@resultId, @input, @output, @start_time, @end_time, @prompt_tokens, @completion_tokens)
              `
            ).run({
              resultId,
              input: JSON.stringify(trace.input),
              output: JSON.stringify(trace.output),
              start_time: Math.round(trace.start),
              end_time: Math.round(trace.end),
              prompt_tokens: trace.usage?.promptTokens ?? null,
              completion_tokens: trace.usage?.completionTokens ?? null,
            });
          }
        }
      }
    }
  }
};

export interface ResultWithInlineScoresAndTraces extends Db.Result {
  scores: Db.Score[];
  traces: Db.Trace[];
}

interface EvalWithInlineResults extends Db.Eval {
  results: ResultWithInlineScoresAndTraces[];
}

/**
 * @deprecated
 *
 * Used in existing tests, but in future code should be replaced
 * by more specific queries.
 */
export const getEvalsAsRecord = async (
  db: SQLiteDatabase
): Promise<Record<string, EvalWithInlineResults[]>> => {
  const evals = db.prepare<unknown[], Db.Eval>(`SELECT * FROM evals`).all();

  const allResults = getResults(
    db,
    evals.map((e) => e.id)
  );

  const allScores = getScores(
    db,
    allResults.map((r) => r.id)
  );

  const allTraces = getTraces(
    db,
    allResults.map((r) => r.id)
  );

  const recordOfEvals: Record<string, EvalWithInlineResults[]> = {};

  for (const evaluation of evals) {
    const key = evaluation.name;
    if (!recordOfEvals[key]) {
      recordOfEvals[key] = [];
    }

    const results = allResults.filter((r) => r.eval_id === evaluation.id);
    const resultsWithScores = results.map((r) => {
      const scores = allScores.filter((s) => s.result_id === r.id);
      const traces = allTraces.filter((t) => t.result_id === r.id);

      return { ...r, scores, traces };
    });

    recordOfEvals[key].push({
      ...evaluation,
      results: resultsWithScores,
    });
  }

  return recordOfEvals;
};

export const getRun = (db: BetterSqlite3.Database, runId: number) => {
  return db
    .prepare<{ runId: number }, Db.Run>(
      `
    SELECT * FROM runs
    WHERE id = @runId
  `
    )
    .get({ runId });
};

export const getEvals = (db: BetterSqlite3.Database, runId: number) => {
  return db
    .prepare<{ runId: number }, Db.Eval>(
      `
    SELECT * FROM evals
    WHERE run_id = @runId
  `
    )
    .all({ runId });
};

export const getResults = (db: BetterSqlite3.Database, evalIds: number[]) => {
  return db
    .prepare<unknown[], Db.Result>(
      `
    SELECT * FROM results
    WHERE eval_id IN (${evalIds.join(",")})
  `
    )
    .all()
    .map((r) => jsonParseFields(r, ["input", "output"]));
};

export const getScores = (db: BetterSqlite3.Database, resultIds: number[]) => {
  return db
    .prepare<unknown[], Db.Score>(
      `
    SELECT * FROM scores
    WHERE result_id IN (${resultIds.join(",")})
  `
    )
    .all()
    .map((r) => jsonParseFields(r, ["metadata"]));
};

export const getTraces = (db: BetterSqlite3.Database, resultIds: number[]) => {
  return db
    .prepare<unknown[], Db.Trace>(
      `
    SELECT * FROM traces
    WHERE result_id IN (${resultIds.join(",")})
  `
    )
    .all()
    .map((t) => jsonParseFields(t, ["input", "output"]));
};

export const getMostRecentRun = (
  db: BetterSqlite3.Database,
  runType: "full" | "partial"
) => {
  const run = db
    .prepare<{ runType: string }, Db.Run>(
      `
    SELECT * FROM runs
    WHERE runType = @runType
    ORDER BY created_at DESC
    LIMIT 1
  `
    )
    .get({ runType });

  return run;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const jsonParseFields = <T extends object, K extends keyof T>(
  obj: T,
  fields: K[]
): Prettify<Omit<T, K> & Record<K, unknown>> => {
  const objToReturn: any = {};

  for (const key of Object.keys(obj)) {
    const value = (obj as any)[key];
    if ((fields as any).includes(key)) {
      objToReturn[key] = JSON.parse(value);
    } else {
      objToReturn[key] = value;
    }
  }

  return objToReturn;
};
