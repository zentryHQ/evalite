import type * as BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";

export const db: BetterSqlite3.Database = new Database(":memory:");
