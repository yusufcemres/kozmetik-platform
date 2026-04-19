import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.log('No REDIS_URL configured — cache disabled');
      return;
    }

    try {
      const useTls = redisUrl.startsWith('rediss://');
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 500, 5000),
        reconnectOnError: (err) => {
          const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
          return targetErrors.some((t) => err.message.includes(t));
        },
        family: 0,
        ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
      });

      this.client.on('connect', () => this.logger.log('Redis: TCP connected'));
      this.client.on('ready', () => this.logger.log('Redis: ready (cache active)'));
      this.client.on('error', (err) => this.logger.warn(`Redis error: ${err.message}`));
      this.client.on('close', () => this.logger.warn('Redis: connection closed'));
      this.client.on('reconnecting', (ms: number) => this.logger.log(`Redis: reconnecting in ${ms}ms`));
    } catch (err) {
      this.logger.warn(`Redis init failed: ${(err as Error).message} — cache disabled`);
      this.client = null;
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
