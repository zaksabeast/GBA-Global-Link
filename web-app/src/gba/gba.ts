import { UsbSerial } from "./serial";

export function to_le_bytes(num: number): Uint8Array {
  return Uint8Array.from([num >> 0, num >> 8, num >> 16, num >> 24]);
}

function formatBuf(buf: Uint32Array): string {
  return [...buf].map((n) => n.toString(16).padStart(8, "0")).join(", ");
}

const COMMAND_MAP = {
  0x10: "Init1",
  0x3d: "Init2",
  0x11: "Unknown",
  0x13: "GetSomeValue",
  0x14: "Unknown2",
  0x16: "Broadcast",
  0x17: "Setup",
  0x19: "StartHost",
  0x1a: "AcceptConnections",
  0x1b: "EndHost",
  0x1c: "BroadcastReadStart",
  0x1d: "BroadcastReadPoll",
  0x1e: "BroadcastReadEnd",
  0x1f: "Connect",
  0x20: "IsConnecting",
  0x21: "FinishConnecting",
  0x24: "SendData",
  0x25: "SendDataAndWait",
  0x26: "ReceiveData",
  0x27: "ReceiveDataAndWait",
  0x28: "ReceiveDataAndWaitResponse",
} as const;

type CommandMap = typeof COMMAND_MAP;
type CommandNum = keyof CommandMap;
export type Command = CommandMap[CommandNum];

const COMMAND_NUMS = Object.keys(COMMAND_MAP).map((num) => parseInt(num, 10));

function isCommandNum(num: number): num is CommandNum {
  return COMMAND_NUMS.includes(num);
}

function commandFromNumber(num: number): Command | null {
  if (isCommandNum(num)) {
    return COMMAND_MAP[num];
  }

  return null;
}

// Sometimes the pico's attempts to receive data result in no data.
// By always sending something, the pico can determine when a lack of data is intentional.
const RESPONSE_MAGIC = 0xc0dec0de;

type Request = {
  command: Command;
  payload: Uint32Array;
};

export class GbaSerial {
  serial: UsbSerial;

  constructor(device: USBDevice, interfaceNum: number) {
    this.serial = new UsbSerial(device, interfaceNum);
  }

  async init() {
    await this.serial.init();
  }

  async sendResponse(data: Uint32Array): Promise<void> {
    const response = Uint32Array.from([RESPONSE_MAGIC, ...data]);
    await this.serial.send(response);
  }

  async recvRequest(): Promise<Request | null> {
    const buf = await this.serial.recv(0x100);

    if (buf.length < 1) {
      return null;
    }

    const header = buf[0];

    if (header == null || header >>> 16 !== 0x9966) {
      console.error(`Received invalid header ${header} with ${formatBuf(buf)}`);
      return null;
    }

    const commandNum = header & 0xff;
    const command = commandFromNumber(commandNum);

    if (command == null) {
      console.error(
        `Received unknown command ${commandNum} with ${formatBuf(buf)}`
      );
      return null;
    }

    const payload = buf.slice(1);
    const size = (header >>> 8) & 0xff;

    if (payload.length !== size) {
      console.error(
        `Payload error: ${
          payload.length
        } !== ${size}.  Command: ${command}, payload ${formatBuf(buf)}`
      );
    }

    return {
      command,
      payload,
    };
  }
}
