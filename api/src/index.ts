import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
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
  console.log("User connected", socket.id);

  const log =
    (name: string) =>
    (...args: unknown[]) =>
      console.log(socket.id, name, ...args);

  socket.on("Init1", log("Init1"));
  socket.on("Init2", log("Init2"));
  socket.on("Unknown", log("Unknown"));
  socket.on("GetSomeValue", log("GetSomeValue"));
  socket.on("Broadcast", log("Broadcast"));
  socket.on("Setup", log("Setup"));
  socket.on("StartHost", log("StartHost"));
  socket.on("AcceptConnections", log("AcceptConnections"));
  socket.on("EndHost", log("EndHost"));
  socket.on("BroadcastReadStart", log("BroadcastReadStart"));
  socket.on("BroadcastReadPoll", log("BroadcastReadPoll"));
  socket.on("BroadcastReadEnd", log("BroadcastReadEnd"));
  socket.on("Connect", log("Connect"));
  socket.on("IsConnecting", log("IsConnecting"));
  socket.on("FinishConnecting", log("FinishConnecting"));
  socket.on("SendData", log("SendData"));
  socket.on("SendDataAndWait", log("SendDataAndWait"));
  socket.on("ReceiveData", log("ReceiveData"));
  socket.on("ReceiveDataAndWait", log("ReceiveDataAndWait"));
  socket.on("ReceiveDataAndWaitResponse", log("ReceiveDataAndWaitResponse"));
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
