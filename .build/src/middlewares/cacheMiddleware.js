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
export const cacheMiddleware = (prefix, ttl = 60) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${prefix}`;
    try {
        const cachedData = yield redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return res.json(JSON.parse(cachedData));
        }
        const originalJson = res.json;
        res.json = (body) => {
            redisClient.setEx(cacheKey, ttl, JSON.stringify(body));
            return originalJson.call(res, body);
        };
        next();
    }
    catch (err) {
        console.error('Cache Error', err);
        next();
    }
});
