#[derive(PartialEq, Eq)]
pub enum SendResult<T> {
    Reset,
    Data(T),
}
