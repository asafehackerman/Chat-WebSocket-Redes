import express, { Application } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { setupRoutes } from "./routes";
import { listenSocket } from "./socket";
import { log } from "./utils";

export class App {
  private app: Application;
  private http: http.Server;
  private io: Server;
  private rooms: Set<string> = new Set();

  constructor() {
    this.app = express();
    this.http = http.createServer(this.app);
    this.io = new Server(this.http);

    this.setupMiddleware();
    setupRoutes(this.app, this.rooms);
    listenSocket(this.io, this.rooms);
  }

  private setupMiddleware() {
    this.app.use(express.static(path.join(__dirname, "..", "public")));
    this.app.use(express.json());
  }

  listenServer() {
    const port = Number(process.env.PORT || 3000);
    const host = process.env.HOST || "0.0.0.0";
    this.http.listen(port, host, () =>
      log("HTTP", `Servidor rodando em http://${host}:${port}`)
    );
  }
}
