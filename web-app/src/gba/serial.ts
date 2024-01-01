export function to_le_bytes(num: number): Uint8Array {
  return Uint8Array.from([num >> 0, num >> 8, num >> 16, num >> 24]);
}

export class UsbSerial {
  device: USBDevice;
  interface: number;
  inEndpoint: number;
  outEndpoint: number;

  constructor(device: USBDevice, interfaceNum: number) {
    this.device = device;
    this.interface = interfaceNum;
    this.inEndpoint = 0;
    this.outEndpoint = 0;
  }

  async init() {
    await this.device.open();
    await this.device.claimInterface(this.interface);
    this.inEndpoint = this.getEndpointNumber("in") ?? 0;
    this.outEndpoint = this.getEndpointNumber("out") ?? 0;
  }

  getEndpointNumber(direction: USBDirection): number | null {
    return (
      this.device.configuration?.interfaces[
        this.interface
      ].alternate.endpoints.find((endpoint) => endpoint.direction === direction)
        ?.endpointNumber ?? null
    );
  }

  async send(data: Uint32Array): Promise<void> {
    const u8Buf = new Uint8Array(data.buffer);
    await this.device.transferOut(this.outEndpoint, u8Buf);
  }

  async recv(maxWordSize: number): Promise<Uint32Array> {
    const read = await this.device.transferIn(this.inEndpoint, maxWordSize * 4);
    if (read.data == null || read.data.byteLength < 4) {
      return Uint32Array.from([]);
    }

    const length = Math.floor(read.data.byteLength / 4) * 4;
    const result = [];
    for (let i = 0; i < length; i += 4) {
      result.push(read.data.getUint32(i, true));
    }

    return Uint32Array.from(result);
  }
}
