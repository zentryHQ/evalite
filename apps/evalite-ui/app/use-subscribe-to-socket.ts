import type { Evalite } from "@evalite/core";
import { DEFAULT_SERVER_PORT } from "@evalite/core/constants";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export const useSubscribeToTestServer = () => {
  const [state, setState] = useState<"idle" | "running" | "failed">("idle");

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
          setState("running");
          break;
        case "RUN_COMPLETE":
          setState("idle");
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return { state };
};
