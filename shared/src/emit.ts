import { ServerCommand, ClientCommand } from "./command";

type EventEmitter = {
  emit: (event: string, data: unknown) => void;
};

export function emitServerCommand<Emitter extends EventEmitter>(
  emitter: Emitter,
  command: ServerCommand
) {
  emitter.emit("ServerCommand", command);
}

export function emitClientCommand<Emitter extends EventEmitter>(
  emitter: Emitter,
  command: ClientCommand
) {
  emitter.emit("ClientCommand", command);
}
