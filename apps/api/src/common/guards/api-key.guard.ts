import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { ApiKey } from '@database/entities';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'] as string;

    if (!apiKeyHeader) {
      throw new UnauthorizedException('API key required (X-API-Key header)');
    }

    const keyHash = createHash('sha256').update(apiKeyHeader).digest('hex');
    const keyPrefix = apiKeyHeader.substring(0, 12);

    const apiKey = await this.apiKeyRepo.findOne({
      where: { key_hash: keyHash, key_prefix: keyPrefix, is_active: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Attach API key info to request for downstream use
    request.apiKey = apiKey;

    // Update usage stats (fire-and-forget)
    this.apiKeyRepo.update(apiKey.api_key_id, {
      total_requests: () => 'total_requests + 1',
      last_request_at: new Date(),
    });

    return true;
  }
}
