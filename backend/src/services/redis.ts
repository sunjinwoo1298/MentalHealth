import Redis from 'redis';

export class RedisService {
  private client: any;

  constructor() {
    // For hackathon, we'll make Redis optional
    if (process.env.REDIS_URL) {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL
      });
    }
  }

  async connect() {
    if (this.client) {
      await this.client.connect();
    }
  }

  async set(key: string, value: string, ttl?: number) {
    if (this.client) {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    }
  }

  async get(key: string) {
    if (this.client) {
      return await this.client.get(key);
    }
    return null;
  }

  async close() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
