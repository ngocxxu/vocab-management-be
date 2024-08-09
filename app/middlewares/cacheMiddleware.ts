import { redisClient } from '..';
import express from 'express';

export const cacheMiddleware =
  <T>(prefix: string, ttl: number = 60) =>
  async (
    req: express.Request<{}, {}, {}, T>,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const cacheKey = `${prefix}${JSON.stringify(req.query)}`;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = (body: unknown) => {
        redisClient.setEx(cacheKey, ttl, JSON.stringify(body));
        return originalJson.call(res, body);
      };

      next();
    } catch (err) {
      console.error('Cache Error', err);
      next();
    }
  };
