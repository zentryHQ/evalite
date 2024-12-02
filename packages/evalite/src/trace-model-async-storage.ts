import type { Evalite } from "@evalite/core";
import { AsyncLocalStorage } from "async_hooks";

export const reportTraceLocalStorage = new AsyncLocalStorage<
  (trace: Evalite.Trace) => void
>();
