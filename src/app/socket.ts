import { Server, Socket } from "socket.io";
import { cleanupRooms, getTime, log } from "./utils";

export function listenSocket(io: Server, rooms: Set<string>) {
  io.on("connection", (socket: Socket) => {
    log("SOCKET", `Conexão => ${socket.id}`);

    socket.on("join_room", (room: string, ack?: Function) => {
      try {
        room = String(room || "").trim();
        if (!room) return ack?.({ ok: false, error: "Nome de sala inválido" });

        socket.join(room);
        rooms.add(room);
        const size = io.sockets.adapter.rooms.get(room)?.size ?? 0;

        log("JOIN", `${socket.id} entrou na sala "${room}" (users=${size})`);

        io.to(room).emit("system", {
          text: `Usuário entrou (${socket.id.substring(0, 6)})`,
          time: getTime(),
        });

        ack?.({ ok: true, room, users: size });
      } catch (err) {
        ack?.({ ok: false, error: String(err) });
      }
    });

    socket.on("leave_room", (room: string, ack?: Function) => {
      try {
        room = String(room || "").trim();
        socket.leave(room);
        const size = io.sockets.adapter.rooms.get(room)?.size ?? 0;
        if (size === 0) rooms.delete(room);

        log("LEAVE", `${socket.id} saiu da sala "${room}" (users=${size})`);

        io.to(room).emit("system", {
          text: `Usuário saiu (${socket.id.substring(0, 6)})`,
          time: getTime(),
        });

        cleanupRooms(io, rooms);
        ack?.({ ok: true, room, users: size });
      } catch (err) {
        ack?.({ ok: false, error: String(err) });
      }
    });

    socket.on("message", (payload: any, ack?: Function) => {
      try {
        const room = String(payload.room || "").trim();
        const text = String(payload.text || "").trim();
        const nick = String(payload.nick || socket.id.substring(0, 6));

        if (!room || !text)
          return ack?.({ ok: false, error: "room/text obrigatório" });

        const time = getTime();
        io.to(room).emit("message", { room, text, nick, time });
        log("MSG", `[${room}] ${nick}: ${text}`);

        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: String(err) });
      }
    });

    socket.on("disconnect", (reason) => {
      log("DISCONNECT", `${socket.id} (${reason})`);
      cleanupRooms(io, rooms);
    });
  });
}
