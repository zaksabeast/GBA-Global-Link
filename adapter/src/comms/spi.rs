use embedded_hal::digital::{InputPin, OutputPin};
use rp2040_hal::gpio::{
    bank0 as peris, FunctionNull, FunctionSio, Pin, PullDown, SioInput, SioOutput,
};

type DefaultPin<P> = Pin<P, FunctionNull, PullDown>;
type Input<P> = Pin<P, FunctionSio<SioInput>, PullDown>;
type Output<P> = Pin<P, FunctionSio<SioOutput>, PullDown>;

pub struct Spi {
    p_clk: Input<peris::Gpio2>,
    p_tx: Output<peris::Gpio3>,
    p_rx: Input<peris::Gpio4>,
    p_reset: Input<peris::Gpio5>,
    reset_requested: bool,
}

impl Spi {
    pub fn new(
        p_clk: DefaultPin<peris::Gpio2>,
        p_tx: DefaultPin<peris::Gpio3>,
        p_rx: DefaultPin<peris::Gpio4>,
        p_reset: DefaultPin<peris::Gpio5>,
    ) -> Self {
        Self {
            p_clk: p_clk.into_function(),
            p_tx: p_tx.into_function(),
            p_rx: p_rx.into_function(),
            p_reset: p_reset.into_function(),
            reset_requested: false,
        }
    }

    pub fn reset(&mut self) {
        self.reset_requested = false;
    }

    #[inline(never)]
    pub fn reset_requested(&self) -> bool {
        self.reset_requested
    }

    #[inline]
    pub fn p_tx_set_high(&mut self) {
        let _ = self.p_tx.set_high();
    }

    #[inline]
    pub fn p_tx_set_low(&mut self) {
        let _ = self.p_tx.set_low();
    }

    #[inline]
    pub fn p_rx_is_low(&self) -> bool {
        self.p_rx.is_low().unwrap_or_default()
    }

    fn transfer_bit(&mut self, bit: u8) -> u8 {
        while self.p_clk.is_high().unwrap_or_default() {
            if self.p_reset.is_high().unwrap_or_default() {
                self.reset_requested = true;
            }
        }
        if bit == 0 {
            let _ = self.p_tx.set_low();
        } else {
            let _ = self.p_tx.set_high();
        }
        while self.p_clk.is_low().unwrap_or_default() {}
        self.p_rx.is_high().unwrap_or_default() as u8
    }

    #[inline(never)]
    pub fn transfer_u32(&mut self, data: u32) -> u32 {
        let bits = [
            ((data >> 31) & 1) as u8,
            ((data >> 30) & 1) as u8,
            ((data >> 29) & 1) as u8,
            ((data >> 28) & 1) as u8,
            ((data >> 27) & 1) as u8,
            ((data >> 26) & 1) as u8,
            ((data >> 25) & 1) as u8,
            ((data >> 24) & 1) as u8,
            ((data >> 23) & 1) as u8,
            ((data >> 22) & 1) as u8,
            ((data >> 21) & 1) as u8,
            ((data >> 20) & 1) as u8,
            ((data >> 19) & 1) as u8,
            ((data >> 18) & 1) as u8,
            ((data >> 17) & 1) as u8,
            ((data >> 16) & 1) as u8,
            ((data >> 15) & 1) as u8,
            ((data >> 14) & 1) as u8,
            ((data >> 13) & 1) as u8,
            ((data >> 12) & 1) as u8,
            ((data >> 11) & 1) as u8,
            ((data >> 10) & 1) as u8,
            ((data >> 9) & 1) as u8,
            ((data >> 8) & 1) as u8,
            ((data >> 7) & 1) as u8,
            ((data >> 6) & 1) as u8,
            ((data >> 5) & 1) as u8,
            ((data >> 4) & 1) as u8,
            ((data >> 3) & 1) as u8,
            ((data >> 2) & 1) as u8,
            ((data >> 1) & 1) as u8,
            (data & 1) as u8,
        ];
        let mut rx = 0u32;

        for bit in bits {
            rx <<= 1;
            rx |= self.transfer_bit(bit) as u32;
        }

        rx
    }
}
