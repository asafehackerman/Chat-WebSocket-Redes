import { Application, Request, Response } from "express";
import path from "path";

export function setupRoutes(app: Application, rooms: Set<string>) {
  app.get("/rooms", (req: Request, res: Response) => {
    res.json({ rooms: Array.from(rooms).sort() });
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });
}
