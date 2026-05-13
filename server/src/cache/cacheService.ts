import { getRedisClient } from './redisClient.js';

const DEFAULT_TTL = 300;

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;
    try {
      const val = await redis.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // ignore cache write failures
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;
    try {
      await redis.del(key);
    } catch {
      // ignore
    }
  },

  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const result = await fn();
    await this.set(key, result, ttlSeconds);
    return result;
  },
};
