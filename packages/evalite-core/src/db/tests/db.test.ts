import { it } from "vitest";
import { createDatabase } from "../migrate.js";
import { db } from "../db.js";

it("Should let you save an eval", async () => {
  createDatabase(db);
});
