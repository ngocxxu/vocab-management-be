import { Server, Socket } from 'socket.io';

export const socketHandlers = (
  socket: Socket & { user: { id: string; email: string } },
  io: Server
) => {
  const userId = socket.user.id;

  console.log(`User ${userId} connected:`, socket.id);

  // Auto join room following userId
  socket.join(`user-${userId}`);
  console.log(`User ${userId} joined room automatically`);

  // Join all users room
  // This room can be used for broadcasting messages to all users
  socket.join('all-users');     

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });

  // BE receives a message from FE and sends it to the target room
  socket.on('send-message', (data) => {
    const senderId = socket.user.id;
    const senderName = socket.user.email;

    io.to(data.targetRoom).emit('new-message', {
      message: data.message,
      senderId,
      senderName,
      timestamp: new Date(),
    });
  });

  // Handle ping-pong to test connection
  socket.on('ping', () => {
    socket.emit('pong', {
      userId,
      timestamp: new Date(),
      message: 'Server is alive!',
    });
  });
};
