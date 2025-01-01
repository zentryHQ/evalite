import { describe, expect, it, vitest } from "vitest";
import { createProgram } from "./command.js";

describe("createCommand", () => {
  it("evalite without path", async () => {
    const watch = vitest.fn();
    const runOnceAtPath = vitest.fn();
    const program = createProgram({
      watch,
      runOnceAtPath,
    });

    await program.parseAsync(["", "evalite"]);

    expect(watch).not.toHaveBeenCalled();

    expect(runOnceAtPath).toHaveBeenCalled();
    expect(runOnceAtPath).toHaveBeenCalledWith(undefined);
  });

  it("evalite with path", async () => {
    const watch = vitest.fn();
    const runOnceAtPath = vitest.fn();
    const program = createProgram({
      watch,
      runOnceAtPath,
    });

    await program.parseAsync(["", "evalite", "./src"]);

    expect(watch).not.toHaveBeenCalled();
    expect(runOnceAtPath).toHaveBeenCalledWith("./src");
  });

  it("evalite watch", async () => {
    const watch = vitest.fn();
    const runOnceAtPath = vitest.fn();
    const program = createProgram({
      watch,
      runOnceAtPath,
    });

    await program.parseAsync(["", "evalite", "watch"]);

    expect(watch).toHaveBeenCalledWith(undefined);
    expect(runOnceAtPath).not.toHaveBeenCalled();
  });

  it("evalite watch with path", async () => {
    const watch = vitest.fn();
    const runOnceAtPath = vitest.fn();
    const program = createProgram({
      watch,
      runOnceAtPath,
    });

    await program.parseAsync(["", "evalite", "watch", "./src"]);

    expect(watch).toHaveBeenCalledWith("./src");
    expect(runOnceAtPath).not.toHaveBeenCalled();
  });
});
