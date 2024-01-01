use super::result::SendResult;
use super::spi::Spi;
use super::wap::Wap;
use crate::unwrap_send;
use num_enum::{FromPrimitive, IntoPrimitive};

const WEB_APP_MAGIC: u32 = 0xc0dec0de;

#[derive(IntoPrimitive, FromPrimitive, PartialEq)]
#[repr(u8)]
enum Command {
    #[num_enum(default)]
    None = 0x00,
    Init1 = 0x10,
    Init2 = 0x3d,
    Unknown = 0x11,
    GetSomeValue = 0x13,
    Broadcast = 0x16,
    Setup = 0x17,
    StartHost = 0x19,
    AcceptConnections = 0x1a,
    EndHost = 0x1b,
    BroadcastReadStart = 0x1c,
    BroadcastReadPoll = 0x1d,
    BroadcastReadEnd = 0x1e,
    Connect = 0x1f,
    IsConnecting = 0x20,
    FinishConnecting = 0x21,
    SendData = 0x24,
    SendDataAndWait = 0x25,
    ReceiveData = 0x26,
    ReceiveDataAndWait = 0x27,
    ReceiveDataAndWaitResponse = 0x28,
}

pub struct Router {
    wap: Wap,
}

impl Router {
    pub fn new(spi: Spi) -> Self {
        Self { wap: Wap::new(spi) }
    }

    fn login(&mut self) {
        self.wap.login()
    }

    fn reset(&mut self) {
        self.wap.reset();
    }

    fn handle_req(&mut self, res_buf: &mut [u32]) -> SendResult<()> {
        let req = unwrap_send!(self.wap.recv_req());
        let command = Command::from(req.command());

        // Ignore responses
        if req.is_response() {
            return SendResult::Data(());
        }

        match command {
            Command::SendDataAndWait => {
                return self.wap.async_ack();
            }
            Command::ReceiveDataAndWait => {
                return self.wap.async_ack();
            }
            // Forward all other requests to the web app
            _ => {}
        };

        let recv_size = crate::serial_usb::transfer32(req.raw(), res_buf);
        let res = &res_buf[..recv_size];

        if recv_size == 0 || res[0] != WEB_APP_MAGIC {
            return self.wap.reply_req(&[]);
        }

        let wap_res = &res[1..];
        self.wap.reply_req(wap_res)
    }

    pub fn run(&mut self) -> ! {
        let mut res_buf = [0u32; 0xff];

        loop {
            self.reset();
            self.login();

            loop {
                if self.handle_req(&mut res_buf) == SendResult::Reset {
                    break;
                };
            }
        }
    }
}
