use super::gpi::Gpi;
use super::packet::CommandPacket;
use super::result::SendResult;
use super::spi::Spi;
use crate::unwrap_send;

pub type Request = CommandPacket;

pub struct Wap {
    gpi: Gpi,
    packet: CommandPacket,
}

impl Wap {
    pub fn new(spi: Spi) -> Self {
        Self {
            gpi: Gpi::new(spi),
            packet: CommandPacket::new(),
        }
    }

    pub fn reset(&mut self) {
        self.gpi.reset()
    }

    pub fn login(&mut self) {
        self.gpi.login()
    }

    pub fn recv_req(&mut self) -> SendResult<&Request> {
        let header = match self.gpi.send(0x80000000) {
            SendResult::Data(rx) => rx,
            SendResult::Reset => return SendResult::Reset,
        };

        if self.packet.set_header(header).is_err() {
            return SendResult::Reset;
        }

        for word in self.packet.data_mut() {
            *word = match self.gpi.send(0x80000000) {
                SendResult::Data(rx) => rx,
                SendResult::Reset => return SendResult::Reset,
            };
        }

        SendResult::Data(&self.packet)
    }

    #[inline]
    fn send(&mut self, data: &[u32], is_response: bool) -> SendResult<()> {
        self.packet.set_data(data);
        let header = if is_response {
            self.packet.response_header()
        } else {
            self.packet.header()
        };
        if self.gpi.send(header) == SendResult::Reset {
            return SendResult::Reset;
        }

        for word in self.packet.data() {
            if self.gpi.send(*word) == SendResult::Reset {
                return SendResult::Reset;
            };
        }

        SendResult::Data(())
    }

    pub fn send_req<Cmd: Into<u8>>(&mut self, command: Cmd, data: &[u32]) -> SendResult<()> {
        self.packet.set_command(command.into());
        self.send(data, false)
    }

    pub fn reply_req(&mut self, data: &[u32]) -> SendResult<()> {
        self.send(data, true)
    }

    pub fn async_ack(&mut self) -> SendResult<()> {
        unwrap_send!(self.send_req(0xa8, &[]));
        unwrap_send!(self.gpi.send(0x80000000));
        SendResult::Data(())
    }
}
