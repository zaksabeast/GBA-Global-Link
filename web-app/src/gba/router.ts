import { match } from "ts-pattern";
import { GbaSerial } from "./gba";
import { socket } from "../socket";

type Context = {
  someValue: number;
  someId: number;
  connectedId: number | null;
};

export function newContext(): Context {
  return {
    someValue: 0x00000000,
    someId: 0x00002abc,
    connectedId: null,
  };
}

export async function handleRequest(
  gba: GbaSerial,
  context: Context
): Promise<Context> {
  const req = await gba.recvRequest();

  if (req == null) {
    return context;
  }

  const updatedContext = { ...context };
  socket.emit(req.command, new Uint8Array(req.payload.buffer));
  const response: Uint32Array = match(req.command)
    .with("Init1", emptyResponse)
    .with("Init2", emptyResponse)
    .with("Unknown", handleUnknown)
    .with("GetSomeValue", () => handleGetSomeValue(updatedContext))
    .with("Broadcast", emptyResponse)
    .with("Setup", emptyResponse)
    .with("StartHost", emptyResponse)
    .with("AcceptConnections", emptyResponse)
    .with("EndHost", emptyResponse)
    .with("BroadcastReadStart", emptyResponse)
    .with("BroadcastReadPoll", handleRecvBroadcast)
    .with("BroadcastReadEnd", handleRecvBroadcast)
    .with("Connect", () => handleConnect(req.payload))
    .with("IsConnecting", () => handleIsConnecting(updatedContext))
    .with("FinishConnecting", () => handleIsConnecting(updatedContext))
    .with("SendData", emptyResponse)
    .with("SendDataAndWait", emptyResponse)
    .with("ReceiveData", emptyResponse)
    .with("ReceiveDataAndWait", emptyResponse)
    .with("ReceiveDataAndWaitResponse", emptyResponse)
    .otherwise(emptyResponse);

  await gba.sendResponse(response);
  return updatedContext;
}

function emptyResponse() {
  return Uint32Array.from([]);
}

function handleUnknown() {
  return Uint32Array.from([0x000000ff]);
}

function handleGetSomeValue(context: Context) {
  context.someValue =
    context.someValue === 0x00000000
      ? 0x0200abcd // I'm not sure how this value is actually generated, but it's always 0x0200xxxx
      : 0x00000000;

  return Uint32Array.from([context.someValue]);
}

function handleRecvBroadcast() {
  return Uint32Array.from([]);
}

function handleConnect(input: Uint32Array) {
  if (input.length > 0) {
    // Todo: do something with this.
    // const connectId = input[0];
  }
  return Uint32Array.from([]);
}

function handleIsConnecting(context: Context) {
  const result = context.connectedId == null ? 0x01000000 : context.someId;
  return Uint32Array.from([result]);
}
