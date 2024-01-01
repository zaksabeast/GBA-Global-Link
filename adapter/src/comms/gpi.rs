use super::login::login;
use super::result::SendResult;
use super::spi::Spi;
use crate::unwrap_send;

#[inline(never)]
fn ack_recv(spi: &mut Spi) {
    // Make sure it's low, just to be safe
    spi.p_tx_set_low();
    cortex_m::asm::delay(100);
    spi.p_tx_set_high();
    spi.p_tx_set_high();
    spi.p_tx_set_high();
    while spi.p_rx_is_low() {}
}

#[inline(never)]
fn ack_ready_send(spi: &mut Spi) {
    spi.p_tx_set_low();
}

#[inline(never)]
fn send(spi: &mut Spi, data: u32) -> SendResult<u32> {
    let rx = spi.transfer_u32(data);
    if spi.reset_requested() {
        SendResult::Reset
    } else {
        SendResult::Data(rx)
    }
}

#[inline(never)]
fn send_ack(spi: &mut Spi, data: u32) -> SendResult<u32> {
    ack_ready_send(spi);
    let res = unwrap_send!(send(spi, data));
    ack_recv(spi);
    SendResult::Data(res)
}

pub struct Gpi {
    spi: Spi,
}

impl Gpi {
    pub fn new(spi: Spi) -> Self {
        Self { spi }
    }

    pub fn send(&mut self, data: u32) -> SendResult<u32> {
        send_ack(&mut self.spi, data)
    }

    pub fn login(&mut self) {
        login(&mut self.spi)
    }

    pub fn reset(&mut self) {
        self.spi.reset()
    }
}
