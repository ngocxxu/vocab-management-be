import { redisClient } from '../main.js';

export const TTL = 3600;
export const VOCAB_CACHE_PREFIX = 'vocab:';
export const ALL_VOCAB_CACHE_PREFIX = 'all-vocab:';
export const RANDOM_VOCAB_CACHE_PREFIX = 'random-vocab:';
export const VOCAB_TRAINER_CACHE_PREFIX = 'vocab-trainer:';
export const ALL_VOCAB_TRAINER_CACHE_PREFIX = 'all-vocab-trainer:';
export const QUESTION_VOCAB_TRAINER_CACHE_PREFIX = 'question-vocab-trainer:';

export const clearRedisCache = async (KEY_CACHES: string[]): Promise<void> => {
  try {
    for (const prefix of KEY_CACHES) {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`Deleted ${keys.length} keys with prefix "${prefix}"`);
      } else {
        console.log(`No keys found with prefix "${prefix}"`);
      }
    }
  } catch (error) {
    console.error('Error clearing Redis cache:', error);
    throw error;
  }
};
