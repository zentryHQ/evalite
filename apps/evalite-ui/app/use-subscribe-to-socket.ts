import type { Evalite } from "@evalite/core";
import { DEFAULT_SERVER_PORT } from "@evalite/core/constants";
import { useNavigate } from "@remix-run/react";
import { createContext, useEffect, useMemo, useState } from "react";

export const TestServerStateContext = createContext<
  ReturnType<typeof useSubscribeToTestServer>
>({} as never);

export type TestServerState =
  | {
      type: "running";
      filepaths: Set<string>;
    }
  | {
      type: "idle";
    };

export const useSubscribeToTestServer = () => {
  const [state, setState] = useState<TestServerState>({ type: "idle" });

  const navigate = useNavigate();

  useEffect(() => {
    navigate(window.location, {
      preventScrollReset: true,
      replace: true,
    });
  }, [state, navigate]);

  useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:${DEFAULT_SERVER_PORT}/api/socket`
    );

    socket.onmessage = (event) => {
      const data: Evalite.WebsocketEvent = JSON.parse(event.data);
      switch (data.type) {
        case "RUN_IN_PROGRESS":
          setState({
            type: "running",
            filepaths: new Set(data.filepaths),
          });
          break;
        case "RUN_COMPLETE":
          setState({ type: "idle" });
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return useMemo(() => ({ state }), [state]);
};
