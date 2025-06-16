import express from 'express';
import { TUserInfoToken } from '../types/User.types.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticateToken = async (
  req: express.Request<{}, {}, {}, {}>,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const user = await verifyToken(token);

    (req as express.Request & { user: TUserInfoToken }).user =
      user as TUserInfoToken;
    console.log({ user });
    next();
  } catch (error: any) {
    if (error.message === 'Token expired') {
      return res.status(401).json({ message: error.message });
    } else if (error.message === 'Invalid token') {
      return res.status(403).json({ message: error.message });
    } else if (error.message === 'Token not yet active') {
      return res.status(401).json({ message: error.message });
    } else if (error.message === 'No token provided') {
      return res.sendStatus(401);
    } else if (error.message === 'Server configuration error') {
      return res.sendStatus(500);
    }
    return res.status(500).json({ message: 'Server error' });
  }
};
