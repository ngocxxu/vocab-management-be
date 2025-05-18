var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { redisClient } from '../main.js';
export const TTL = 3600;
export const VOCAB_CACHE_PREFIX = 'vocab:';
export const ALL_VOCAB_CACHE_PREFIX = 'all-vocab:';
export const RANDOM_VOCAB_CACHE_PREFIX = 'random-vocab:';
export const VOCAB_TRAINER_CACHE_PREFIX = 'vocab-trainer:';
export const ALL_VOCAB_TRAINER_CACHE_PREFIX = 'all-vocab-trainer:';
export const QUESTION_VOCAB_TRAINER_CACHE_PREFIX = 'question-vocab-trainer:';
export const clearRedisCache = (KEY_CACHES) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const prefix of KEY_CACHES) {
            const keys = yield redisClient.keys(`${prefix}*`);
            if (keys.length > 0) {
                yield redisClient.del(keys);
                console.log(`Deleted ${keys.length} keys with prefix "${prefix}"`);
            }
            else {
                console.log(`No keys found with prefix "${prefix}"`);
            }
        }
    }
    catch (error) {
        console.error('Error clearing Redis cache:', error);
        throw error;
    }
});
