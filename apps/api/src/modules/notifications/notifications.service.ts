import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PushSubscription } from '@database/entities';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpush = require('web-push');

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidReady = false;

  constructor(
    @InjectRepository(PushSubscription) private readonly subs: Repository<PushSubscription>,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const pub = this.config.get<string>('VAPID_PUBLIC_KEY');
    const priv = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT', 'mailto:hello@revela.com.tr');
    if (pub && priv) {
      webpush.setVapidDetails(subject, pub, priv);
      this.vapidReady = true;
      this.logger.log('VAPID keys configured');
    } else {
      this.logger.warn('VAPID keys missing — push notifications disabled');
    }
  }

  getPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') ?? null;
  }

  async subscribe(body: {
    endpoint: string;
    p256dh: string;
    auth: string;
    user_id?: number;
    user_agent?: string;
  }): Promise<{ success: boolean; subscription_id: number }> {
    if (!body.endpoint || !body.p256dh || !body.auth) {
      throw new BadRequestException('Eksik subscription alanları');
    }
    let existing = await this.subs.findOne({ where: { endpoint: body.endpoint } });
    if (existing) {
      existing.p256dh = body.p256dh;
      existing.auth = body.auth;
      existing.is_active = true;
      existing.user_id = body.user_id ?? existing.user_id;
      existing.user_agent = body.user_agent ?? existing.user_agent;
      await this.subs.save(existing);
      return { success: true, subscription_id: existing.subscription_id };
    }
    const saved = await this.subs.save(this.subs.create({
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
      user_id: body.user_id ?? null,
      user_agent: body.user_agent ?? null,
      is_active: true,
    }));
    return { success: true, subscription_id: saved.subscription_id };
  }

  async unsubscribe(endpoint: string): Promise<{ success: boolean }> {
    await this.subs.update({ endpoint }, { is_active: false });
    return { success: true };
  }

  async sendToUser(userId: number, payload: PushPayload): Promise<number> {
    const subs = await this.subs.find({ where: { user_id: userId, is_active: true } });
    return this.sendBatch(subs, payload);
  }

  async sendToAll(payload: PushPayload): Promise<number> {
    const subs = await this.subs.find({ where: { is_active: true } });
    return this.sendBatch(subs, payload);
  }

  private async sendBatch(subs: PushSubscription[], payload: PushPayload): Promise<number> {
    if (!this.vapidReady) {
      this.logger.warn('VAPID not configured, cannot send push');
      return 0;
    }
    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 },
        );
        sub.last_notified_at = new Date();
        await this.subs.save(sub);
        sent++;
      } catch (err: any) {
        this.logger.error(`Push failed for sub ${sub.subscription_id}: ${err.message}`);
        // 410 Gone / 404 = expired subscription
        if (err.statusCode === 410 || err.statusCode === 404) {
          sub.is_active = false;
          await this.subs.save(sub);
        }
      }
    }
    return sent;
  }
}
