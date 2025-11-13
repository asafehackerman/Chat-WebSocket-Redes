import { Server } from "socket.io";

export function getTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour12: false });
}

export function log(prefix: string, message: string) {
  console.log(`[${getTime()}] [${prefix}] ${message}`);
}

export function cleanupRooms(io: Server, rooms: Set<string>) {
  for (const room of Array.from(rooms)) {
    const size = io.sockets.adapter.rooms.get(room)?.size ?? 0;
    if (size === 0) rooms.delete(room);
  }
}
