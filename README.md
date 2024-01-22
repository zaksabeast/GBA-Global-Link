# GBA Wireless Adapter

This project uses a Raspberry Pico to emulate a Gameboy Advance Wireless Adapter.

The main goal of this project is to play Pokemon games across the internet using retail consoles and games.

## Usage

This is still a work in progress, so usage is mostly limited to development.

## Connecting a pico to a GBA

If you look at a Gameboy or Gameboy advance link cable you'll see something similar to this:

```
      /---\
 /-------------\
/ -1-  -3-  -5- \
|               |
\ -2-  -4-  -6- /
 \-------------/
```

Pin description:

1. Vcc
2. GBA Tx, Adapter Rx
3. GBA Rx, Adapter Tx
4. Reset
5. Clk
6. Gnd

Connecting to the pico:

- GBA pin 6 to Pico pin 3 (Gnd <-> Gnd)
- GBA pin 5 to Pico pin 4 (Clk <-> Clk)
- GBA pin 3 to Pico pin 5 (Rx <-> Tx)
- GBA pin 2 to Pico pin 6 (Tx <-> Rx)
- GBA pin 4 to Pico pin 7 (Reset <-> Input)

## Development

You'll need rust and bun to build this project.

1. Push and hold the BOOTSEL button on the pico and plug it into your computer
2. Run `cargo run --release` to flash the pico
3. Run `bun start` in the `web-app` and `api` directories
4. Use the web app with a web usb enabled browser and use the UI to connect with the pico
5. Enter the union room in a Pokemon game and watch the magic

## Project structure

The wireless adapter is broken into several layers:

- SPI (Serial Peripheral Interface)
- GPI (GBA Peripheral Interface, adds ack and ready signals on top of SPI)
- WAP (Wireless Adapter Protocol, adds packets on top of GPI)
- Adapter Router (Adds command handling)

This is similar to TCP -> HTTP -> HTTPS -> REST/GraphQL/etc.

Ideally each layer is unaware of what the other layers add. For example, WAP doesn't know what packets are used for or how the data is transferred - it just deals with packets. Any layer could be replaced with a different implementation using the same interface and the rest of the stack will work just fine.

This helps separate concerns, but also makes it easy to translate between different frameworks and boards.

Currently the adapter router acts as a passthrough to the web app, and the web app handles command resolution. In the future the adapter router might handle commands itself for wifi enabled boards (e.g. the Pico W). Focusing on the web app for now gives the most compatibility.

## Credits

A lot of research to get this built was done with a physical wireless adapter and a logic analyzer.

With that said, there were two helpful resources that helped speed up the process:

- https://problemkaputt.de/gbatek.htm#gbawirelessadapter
- https://gist.github.com/iracigt/50b3a857e4d82c2c11d0dd5f84ecac6b

These documented the login steps, communication, and some commands. Command names used in this project were borrowed from the gist.
