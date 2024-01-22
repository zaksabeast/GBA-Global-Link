import { ServerCommand, ClientCommand } from "./command";

type EventReceiver = {
  on: (event: string, callback: (data: unknown) => void) => void;
};

export function registerOnServerCommand<Receiver extends EventReceiver>(
  receiver: Receiver,
  onServerCommand: (command: ServerCommand) => void
) {
  receiver.on("ServerCommand", (msg) => {
    const parsed = ServerCommand.safeParse(msg);
    if (parsed.success) {
      onServerCommand(parsed.data);
    }
  });
}

export function registerOnClientCommand<Receiver extends EventReceiver>(
  receiver: Receiver,
  onClientCommand: (command: ClientCommand) => void
) {
  receiver.on("ClientCommand", (msg) => {
    const parsed = ClientCommand.safeParse(msg);
    if (parsed.success) {
      onClientCommand(parsed.data);
    }
  });
}
