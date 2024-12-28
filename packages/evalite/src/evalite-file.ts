import { FILES_LOCATION, type Evalite } from "@evalite/core";
import { createHash } from "crypto";
import path from "path";
import { inject } from "vitest";
import { writeFileQueueLocalStorage } from "./write-file-queue-local-storage.js";
import { isEvaliteFile } from "@evalite/core/utils";

export const EvaliteFile = {
  fromBuffer: (buffer: Buffer, extension: string): Evalite.File => {
    const hash = createHash("sha256").update(buffer).digest("hex");

    const filesDirectory = path.join(inject("cwd"), FILES_LOCATION);
    const writeFileQueue = writeFileQueueLocalStorage.getStore();

    if (!writeFileQueue) throw new Error("writeFileQueue not set");

    const filePath = path.join(filesDirectory, `${hash}.${extension}`);

    writeFileQueue(filePath, buffer);

    return EvaliteFile.fromPath(filePath);
  },
  fromPath: (path: string): Evalite.File => {
    return {
      __EvaliteFile: true,
      path,
    };
  },
  isEvaliteFile: isEvaliteFile,
};
