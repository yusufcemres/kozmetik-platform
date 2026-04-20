import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CacheService } from './common/cache/cache.service';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly cacheService: CacheService,
    @Optional() @Inject(DataSource) private readonly dataSource?: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check — DB, Redis, uptime' })
  async check() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = this.cacheService.isConnected;
    const uptimeMs = Date.now() - this.startedAt;

    const allHealthy = (dbStatus !== false) && redisStatus;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'kozmetik-platform-api',
      version: process.env.npm_package_version || '1.0.0',
      // RENDER_GIT_COMMIT is injected by Render at runtime; BUILD_SHA is the
      // Docker ARG fallback for other hosts. Lets us diff live vs master.
      build: {
        sha: process.env.RENDER_GIT_COMMIT || process.env.BUILD_SHA || 'unknown',
        branch: process.env.RENDER_GIT_BRANCH || 'unknown',
        time: process.env.BUILD_TIME || 'unknown',
      },
      uptime: {
        ms: uptimeMs,
        human: this.formatUptime(uptimeMs),
      },
      checks: {
        database: this.dataSource ? (dbStatus ? 'connected' : 'disconnected') : 'skipped',
        redis: redisStatus ? 'connected' : 'disconnected',
      },
      memory: {
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    if (!this.dataSource) return false;
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  }
}
