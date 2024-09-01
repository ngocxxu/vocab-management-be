import jwt from 'jsonwebtoken';
import express from 'express';
import { TUserInfoToken } from '../types/User.types.js';


export const authenticateToken = (
  req: express.Request<{}, {}, {}, {}>,
  res: express.Response,
  next: express.NextFunction
) => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized if not have token
  }

  if (!ACCESS_TOKEN) {
    console.error('ACCESS_TOKEN_SECRET is not set');
    return res.sendStatus(500);
  }

  jwt.verify(token, ACCESS_TOKEN, (err: any, user: any) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.sendStatus(403); // Forbidden if token is invalid
    }

    (req as express.Request & { user: TUserInfoToken }).user =
      user as TUserInfoToken;
    next();
  });
};
