import Redis from 'ioredis';

let client: Redis | null = null;
let available = false;

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 3000,
      enableOfflineQueue: false,
    });

    client.on('connect', () => { available = true; });
    client.on('error', () => { available = false; });
    client.connect().catch(() => { /* connect in background */ });
  }

  return available ? client : null;
}

export function isRedisAvailable(): boolean {
  return available;
}
