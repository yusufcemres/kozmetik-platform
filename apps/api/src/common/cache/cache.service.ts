import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
          lazyConnect: true,
        });
        this.client.connect().catch(() => {
          this.logger.warn('Redis not available — cache disabled');
          this.client = null;
        });
      } catch {
        this.logger.warn('Redis connection failed — cache disabled');
        this.client = null;
      }
    } else {
      this.logger.log('No REDIS_URL configured — cache disabled');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  get isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // silently fail
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch {
      // silently fail
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) {
        await this.client.del(...keys);
      }
    } catch {
      // silently fail
    }
  }
}
