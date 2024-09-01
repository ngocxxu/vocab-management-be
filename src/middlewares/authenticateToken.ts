import jwt from 'jsonwebtoken';
import express from 'express';
import { TUserInfoToken } from '../types/User.types.js';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;

export const authenticateToken = (
  req: express.Request<{}, {}, {}, {}>,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized if not have token
  }

  jwt.verify(token, ACCESS_TOKEN ?? '', (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    (req as express.Request & { user: TUserInfoToken }).user =
      user as TUserInfoToken;
    next();
  });
};
