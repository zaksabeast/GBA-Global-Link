const COMMAND_MAGIC: u32 = 0x9966;

const MAX_U32_DATA_SIZE: usize = 0xff;
const MAX_U32_PACKET_SIZE: usize = MAX_U32_DATA_SIZE + 1;

pub struct CommandPacket {
    data: [u32; MAX_U32_PACKET_SIZE],
}

impl CommandPacket {
    pub fn new() -> Self {
        Self {
            data: [0; MAX_U32_PACKET_SIZE],
        }
    }

    pub fn set_header(&mut self, header: u32) -> Result<(), ()> {
        if header >> 16 != COMMAND_MAGIC {
            return Err(());
        }

        self.data[0] = header;

        Ok(())
    }

    pub fn set_data(&mut self, data: &[u32]) {
        if data.len() > MAX_U32_DATA_SIZE {
            return;
        }

        let size = data.len() as u32;
        let command = self.command() as u32;
        let header = (COMMAND_MAGIC << 16) | (size << 8) | command;
        self.data[0] = header;
        self.data[1..data.len() + 1].copy_from_slice(data);
    }

    pub fn data(&self) -> &[u32] {
        let data_size = self.data_word_len();
        &self.data[1..data_size + 1]
    }

    pub fn data_mut(&mut self) -> &mut [u32] {
        let data_size = self.data_word_len();
        &mut self.data[1..data_size + 1]
    }

    pub fn raw(&self) -> &[u32] {
        &self.data[..self.packet_word_len()]
    }

    pub fn header(&self) -> u32 {
        self.data[0]
    }

    pub fn response_header(&self) -> u32 {
        self.data[0] | 0x80
    }

    pub fn set_command(&mut self, command: u8) {
        let command = command as u32;
        let header = (self.data[0] & 0xffffff00) | command;
        self.data[0] = header;
    }

    pub fn command(&self) -> u8 {
        self.data[0] as u8
    }

    pub fn data_word_len(&self) -> usize {
        ((self.data[0] >> 8) & 0xff) as usize
    }

    pub fn packet_word_len(&self) -> usize {
        self.data_word_len() + 1
    }

    pub fn is_response(&self) -> bool {
        (self.command() & 0b10000000) != 0
    }
}
