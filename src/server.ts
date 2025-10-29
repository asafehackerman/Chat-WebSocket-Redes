import Express, { Application } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

class App {
    private app: Application
    private http: http.Server
    private io: Server

    constructor() {
        this.app = Express()
        this.http = http.createServer(this.app)
        this.io = new Server(this.http)
        this.listenSocket()
        this.setupRoutes()
    }

    private getTime(): string {
        const now = new Date()
        return now.toLocaleTimeString("pt-BR", { hour12: false })
    }

    listenServer() {
        this.http.listen(3000, () => console.log('Servidor rodando às', this.getTime()))
    }

    listenSocket() {
        this.io.on('connection', (socket) => {
            console.log(`[${this.getTime()}] Usuário conectado => ${socket.id}`)

            socket.on("message", (msg) => {
                console.log(`[${this.getTime()}] Mensagem recebida:`, msg)
                this.io.emit("message", msg)
            })
        })
    }

    setupRoutes() {
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "index.html"))
        })
    }
}

const app = new App()
app.listenServer()