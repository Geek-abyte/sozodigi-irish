// src/lib/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const base =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    socket = io(base, {
      transports: ["websocket"],
    });
  }
  return socket;
}
