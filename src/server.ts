import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { registerChatNamespace } from "./sockets/chat";

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

registerChatNamespace(io);

server.listen(PORT, () => {
  console.log(`Sakina API listening on http://localhost:${PORT}`);
});
