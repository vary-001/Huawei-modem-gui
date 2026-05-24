import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export function useModem() {
  const [modem, setModem] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    socket.on("connect", () => {
      setStatus("connected");
    });

    socket.on("server-message", (data) => {
      console.log("Server:", data);
    });

    socket.on("modem-status", (data) => {
      setModem(data);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    return () => {
      socket.off("modem-status");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return { modem, status };
}