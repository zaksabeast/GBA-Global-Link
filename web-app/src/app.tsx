import React from "react";
import * as tst from "ts-toolbelt";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import UsbIcon from "@mui/icons-material/Usb";
import * as webUsb from "./gba";

// Fix navigator global types
const navigator: tst.O.Overwrite<Navigator, { usb: USB | null }> =
  window.navigator;

function useGba(): {
  openDevice: () => Promise<void>;
  gba: webUsb.GbaSerial | null;
} {
  const [gba, setGba] = React.useState<webUsb.GbaSerial | null>(null);

  const disconnect = React.useCallback(() => {
    setGba(null);
    navigator.usb?.removeEventListener("disconnect", disconnect);
  }, []);

  const openDevice = React.useCallback(async () => {
    if (navigator.usb == null) {
      return;
    }
    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x1234 }],
      });
      const serial = new webUsb.GbaSerial(device, 1);
      await serial.init();
      navigator.usb.addEventListener("disconnect", disconnect);
      setGba(serial);
    } catch {
      // Typically no device selected
    }
  }, [disconnect]);

  return {
    openDevice,
    gba,
  };
}

export function App() {
  const { openDevice, gba } = useGba();
  const [log, setLog] = React.useState<string[]>([]);

  const addLog = (newLine: string) => setLog((logs) => [...logs, newLine]);

  React.useEffect(() => {
    let shouldRun = true;
    async function loop() {
      try {
        let context = webUsb.newContext();
        while (shouldRun && gba != null) {
          context = await webUsb.handleRequest(gba, context);
        }
      } catch (error) {
        console.error(error);
        addLog(
          `Encountered error - check logs for details. (${JSON.stringify(
            error
          )})`
        );
      }
    }

    loop();
    return () => {
      shouldRun = false;
    };
  }, [gba]);

  return (
    <Box>
      <Card sx={{ p: 2 }}>
        <Grid spacing={2} container direction="row">
          <Grid item xs={12}>
            <TextField
              multiline
              fullWidth
              minRows={14}
              value={log.join("\n")}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              disabled={gba != null}
              onClick={openDevice}
              startIcon={<UsbIcon />}
              fullWidth
            >
              Connect to GBA
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
