import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import { registerOnClientCommand, emitServerCommand, getUserId } from "shared";
import { config } from "./config";

const app = express();
const server = createServer(app);

const CORS_CONFIG: CorsOptions = {
  origin: config.webAppUrl,
};

app.use(cors(CORS_CONFIG));
app.use(helmet());

const io = new Server(server, {
  cors: CORS_CONFIG,
});

app.get("/", (req, res) => {
  res.send("health check");
});

io.on("connection", (socket) => {
  const userId = getUserId(socket);
  console.log("User connected", userId);

  registerOnClientCommand(socket, (command) => {
    console.log("command", userId, command.op);
    emitServerCommand(io, {
      userId,
      ...command,
    });
  });
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
