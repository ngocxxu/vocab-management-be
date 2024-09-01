import { Response } from 'express';
import { Error } from 'mongoose';

export const handleError = (err: unknown, res: Response, status = 500) => {
  if (err instanceof Error) {
    console.log(err.message);
    res.status(status).json({ error: err.message });
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

export function getRandomElements<T>(
  array: T[],
  count: number,
  targetId: string
) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const target = shuffled.find((item: any) => item.equals(targetId));
  const others = shuffled
    .filter((item: any) => !item.equals(targetId))
    .slice(0, count - 1);

  return [...others, target];
}
