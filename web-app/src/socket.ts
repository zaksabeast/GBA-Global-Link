import { io } from "socket.io-client";
import { config } from "./config";
import {
  emitClientCommand,
  registerOnServerCommand,
  ServerCommand,
  RecvBroadcastFromUser,
  RecvDataFromUser,
  ClientCommand,
  getUserId,
} from "shared";
import { match } from "ts-pattern";

const USER_BROADCASTS = new Map<number, number[]>();
const LATEST_DATA = new Map<number, number[]>();

export function getBroadcasts(): number[] {
  let result: number[] = [];
  for (const [userId, payload] of USER_BROADCASTS) {
    result = [...result, userId, ...payload];
  }
  return result;
}

function onRecvBroadcastFromUser({ userId, payload }: RecvBroadcastFromUser) {
  if (socket.id != null && userId !== getUserId({ id: socket.id })) {
    USER_BROADCASTS.set(userId, payload);
  }
}

function onRecvDataFromUser({ userId, payload }: RecvDataFromUser) {
  LATEST_DATA.set(userId, payload);
}

function onServerCommand(command: ServerCommand) {
  match(command)
    .with({ op: "RecvBroadcastFromUser" }, onRecvBroadcastFromUser)
    .with({ op: "RecvDataFromUser" }, onRecvDataFromUser)
    .exhaustive();
}

const socket = io(config.apiUrl);

registerOnServerCommand(socket, onServerCommand);

export function emitCommand(command: ClientCommand) {
  emitClientCommand(socket, command);
}
