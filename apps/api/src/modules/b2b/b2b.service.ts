import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { ApiKey, Webhook } from '@database/entities';

@Injectable()
export class B2bService {
  private readonly logger = new Logger(B2bService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
  ) {}

  // ─── API Key Management ───

  async createApiKey(data: {
    company_name: string;
    contact_email: string;
    allowed_endpoints?: string[];
    rate_limit_per_hour?: number;
    rate_limit_per_day?: number;
    expires_at?: Date;
  }) {
    const rawKey = `kzm_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);

    const apiKey = this.apiKeyRepo.create({
      company_name: data.company_name,
      contact_email: data.contact_email,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      allowed_endpoints: data.allowed_endpoints || ['*'],
      rate_limit_per_hour: data.rate_limit_per_hour || 1000,
      rate_limit_per_day: data.rate_limit_per_day || 10000,
      expires_at: data.expires_at,
    });

    const saved = await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key created for ${data.company_name} (prefix: ${keyPrefix})`);

    return {
      api_key_id: saved.api_key_id,
      api_key: rawKey, // Only shown once!
      key_prefix: keyPrefix,
      company_name: saved.company_name,
      rate_limit_per_hour: saved.rate_limit_per_hour,
      rate_limit_per_day: saved.rate_limit_per_day,
      message: 'API anahtarınızı güvenli bir yerde saklayın. Tekrar gösterilemez.',
    };
  }

  async listApiKeys() {
    return this.apiKeyRepo.find({
      select: [
        'api_key_id', 'company_name', 'contact_email', 'key_prefix',
        'rate_limit_per_hour', 'rate_limit_per_day', 'total_requests',
        'last_request_at', 'is_active', 'expires_at', 'created_at',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async revokeApiKey(id: number) {
    const key = await this.apiKeyRepo.findOne({ where: { api_key_id: id } });
    if (!key) throw new NotFoundException('API key not found');

    key.is_active = false;
    await this.apiKeyRepo.save(key);
    this.logger.warn(`API key revoked: ${key.key_prefix} (${key.company_name})`);
    return { message: 'API key revoked', key_prefix: key.key_prefix };
  }

  async getApiKeyStats(id: number) {
    const key = await this.apiKeyRepo.findOne({ where: { api_key_id: id } });
    if (!key) throw new NotFoundException('API key not found');

    return {
      api_key_id: key.api_key_id,
      company_name: key.company_name,
      key_prefix: key.key_prefix,
      total_requests: Number(key.total_requests),
      last_request_at: key.last_request_at,
      is_active: key.is_active,
      rate_limit_per_hour: key.rate_limit_per_hour,
      rate_limit_per_day: key.rate_limit_per_day,
    };
  }

  // ─── Webhook Management ───

  async createWebhook(apiKeyId: number, data: {
    url: string;
    events: string[];
  }) {
    const key = await this.apiKeyRepo.findOne({ where: { api_key_id: apiKeyId } });
    if (!key) throw new NotFoundException('API key not found');

    const secret = randomBytes(32).toString('hex');
    const secretHash = createHash('sha256').update(secret).digest('hex');

    const webhook = this.webhookRepo.create({
      api_key_id: apiKeyId,
      url: data.url,
      events: data.events,
      secret_hash: secretHash,
    });

    const saved = await this.webhookRepo.save(webhook);

    return {
      webhook_id: saved.webhook_id,
      url: saved.url,
      events: saved.events,
      secret: secret, // Only shown once
      message: 'Webhook secret\'ınızı güvenli bir yerde saklayın.',
    };
  }

  async listWebhooks(apiKeyId: number) {
    return this.webhookRepo.find({
      where: { api_key_id: apiKeyId },
      select: ['webhook_id', 'url', 'events', 'is_active', 'failed_count', 'last_triggered_at', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async deleteWebhook(webhookId: number) {
    const wh = await this.webhookRepo.findOne({ where: { webhook_id: webhookId } });
    if (!wh) throw new NotFoundException('Webhook not found');

    await this.webhookRepo.remove(wh);
    return { message: 'Webhook deleted' };
  }

  async triggerWebhooks(event: string, payload: Record<string, unknown>) {
    const webhooks = await this.webhookRepo.find({
      where: { is_active: true },
    });

    const matching = webhooks.filter((wh) => wh.events.includes(event) || wh.events.includes('*'));

    for (const wh of matching) {
      try {
        const res = await fetch(wh.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          wh.failed_count++;
        }
        wh.last_triggered_at = new Date();
        await this.webhookRepo.save(wh);

        // Disable after 10 consecutive failures
        if (wh.failed_count >= 10) {
          wh.is_active = false;
          await this.webhookRepo.save(wh);
          this.logger.warn(`Webhook ${wh.webhook_id} disabled after 10 failures`);
        }
      } catch (err) {
        wh.failed_count++;
        await this.webhookRepo.save(wh);
        this.logger.error(`Webhook ${wh.webhook_id} delivery failed`, err);
      }
    }
  }

  // ─── B2B Dashboard ───

  async getB2bMetrics() {
    const totalKeys = await this.apiKeyRepo.count();
    const activeKeys = await this.apiKeyRepo.count({ where: { is_active: true } });
    const totalWebhooks = await this.webhookRepo.count({ where: { is_active: true } });

    const topConsumers = await this.apiKeyRepo
      .createQueryBuilder('ak')
      .select(['ak.company_name', 'ak.key_prefix', 'ak.total_requests', 'ak.last_request_at'])
      .where('ak.is_active = true')
      .orderBy('ak.total_requests', 'DESC')
      .limit(10)
      .getMany();

    return {
      total_keys: totalKeys,
      active_keys: activeKeys,
      active_webhooks: totalWebhooks,
      top_consumers: topConsumers,
    };
  }
}
