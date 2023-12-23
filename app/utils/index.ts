import { Response } from 'express';
import { Error } from 'mongoose';

export const handleError = (err: unknown, res: Response) => {
  if (err instanceof Error) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
    return;
  }
};
