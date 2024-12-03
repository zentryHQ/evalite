import type { Evalite } from "@evalite/core";
import { AsyncLocalStorage } from "async_hooks";

export const reportTraceLocalStorage = new AsyncLocalStorage<
  (trace: Evalite.StoredTrace) => void
>();

export const shouldReportTrace = (): boolean => {
  return process.env.NODE_ENV === "test";
};

export const reportTrace = (trace: Evalite.UserProvidedTrace): void => {
  if (!shouldReportTrace()) {
    return;
  }

  const _reportTrace = reportTraceLocalStorage.getStore();

  if (!_reportTrace) {
    throw new Error(
      "An error occurred: reportTrace must be called inside an evalite eval"
    );
  }

  _reportTrace({
    ...trace,
    duration: trace.end - trace.start,
  });
};
