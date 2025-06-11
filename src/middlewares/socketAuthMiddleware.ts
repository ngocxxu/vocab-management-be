import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;

  try {
    const user = await verifyToken(token);
    (socket as any).user = user;
    next();
  } catch (error: any) {
    console.error('Socket auth error:', error.message);
    next(new Error(error.message));
  }
};