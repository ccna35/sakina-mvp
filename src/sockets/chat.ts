import type { Server, Socket } from 'socket.io';

export function registerChatNamespace(io: Server) {
  const userNs = io.of('/user');
  const modNs = io.of('/mod');

  userNs.on('connection', (socket: Socket) => {
    // In production, validate JWT from handshake and map to userId
    const userId = socket.handshake.auth?.userId as number | undefined;
    if (!userId) return socket.disconnect(true);
    socket.join(`user:${userId}`);
    socket.on('message:send', (payload: { chatId: number; body: string }) => {
      // Persist via HTTP API in real app; for MVP, just emit
      userNs.to(`chat:${payload.chatId}`).emit('message:new', { ...payload, at: new Date().toISOString(), from: userId });
    });
    socket.on('chat:join', (chatId: number) => {
      socket.join(`chat:${chatId}`);
    });
    socket.on('disconnect', () => {});
  });

  // Moderators can join any chat room read-only
  modNs.on('connection', (socket: Socket) => {
    const isMod = socket.handshake.auth?.isMod;
    if (!isMod) return socket.disconnect(true);
    socket.on('mod:watch', (chatId: number) => {
      socket.join(`chat:${chatId}`);
    });
  });
}
