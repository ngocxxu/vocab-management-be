import { redisClient } from '../..';

export const VOCAB_CACHE_PREFIX = 'vocab:';
export const VOCAB_TRAINER_CACHE_PREFIX = 'vocab-trainer:';

// Hàm helper để xóa tất cả cache liên quan đến vocab
export const clearRedisCache = async (KEY_CACHE: string) => {
  const keys = await redisClient.keys(`${KEY_CACHE}*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
