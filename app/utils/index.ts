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

export function getRandomElements(
  array: any,
  count: number,
  targetId: unknown
) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  const target = shuffled.find((item: any) => item.equals(targetId));
  const others = shuffled
    .filter((item: any) => !item.equals(targetId))
    .slice(0, count - 1);

  // Thêm target vào vị trí ngẫu nhiên trong mảng others
  const randomIndex = Math.floor(Math.random() * others.length);
  others.splice(randomIndex, 0, target);

  // Xáo trộn mảng kết quả
  return others.sort(() => Math.random() - 0.5);
}
