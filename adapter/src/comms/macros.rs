#[macro_export]
macro_rules! unwrap_send {
    ($expr:expr) => {
        match $expr {
            $crate::comms::result::SendResult::Reset => {
                return $crate::comms::result::SendResult::Reset
            }
            $crate::comms::result::SendResult::Data(data) => data,
        }
    };
}
