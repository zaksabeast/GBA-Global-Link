// TODO: Use better method to get id
export function getUserId<Socket extends { id: string }>(
  socket: Socket
): number {
  return socket.id.charCodeAt(0);
}
