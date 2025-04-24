import { AsyncLocalStorage } from "async_hooks";
import type { Evalite } from "./types.js";

export const reportTraceLocalStorage = new AsyncLocalStorage<
  (trace: Evalite.Trace) => void
>();

export const shouldReportTrace = (): boolean => {
  return !!process.env.EVALITE_REPORT_TRACES;
};

export const reportTrace = (trace: Evalite.Trace): void => {
  if (!shouldReportTrace()) {
    return;
  }

  const _reportTrace = reportTraceLocalStorage.getStore();

  if (!_reportTrace) {
    throw new Error(
      "An error occurred: reportTrace must be called inside an evalite eval"
    );
  }

  _reportTrace(trace);
};
