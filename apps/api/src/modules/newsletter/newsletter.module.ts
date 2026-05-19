import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NewsletterSubscription } from '@database/entities';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { MailModule } from '@common/mail/mail.module';

/**
 * Newsletter aboneliği modülü (Faz P, Migration 036, 2026-05-19).
 *
 * Dependencies:
 * - MailModule (Resend send via shared service)
 * - NewsletterSubscription repository
 *
 * Cron: şu an manuel admin send. Aylık otomatik (NewsletterCronService)
 * sonraki sprint — content payload editorial workflow gerekli.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscription]),
    ConfigModule,
    MailModule,
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
