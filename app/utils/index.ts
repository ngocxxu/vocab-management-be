import { Response } from 'express';
import { Error } from 'mongoose';

export const handleError = (err: unknown, res: Response) => {
  if (err instanceof Error) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
    return;
  }
};

export const searchRegex = (search: string) => ({
  $regex: `.*${escapeRegex(search)}.*`,
  $options: 'i',
});

function escapeRegex(text: string) {
  // Các ký tự regex đặc biệt của tiếng Việt và tiếng Hàn
  const specialChars = /[.*+?^${}()|[\]\\]/g;
  return text.replace(specialChars, '\\$&');
}
