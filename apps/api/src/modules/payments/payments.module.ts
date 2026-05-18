import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppUser, Payment } from '@database/entities';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsCronService } from './payments.cron';
import { PremiumGuard } from './premium.guard';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { MailModule } from '@common/mail/mail.module';

/**
 * PayTR + Premium tier modülü (Faz 3 başlangıcı, 2026-05-17).
 *
 * Dependencies:
 * - UserAuthModule (AppJwtGuard reuse — magic link auth altyapısı)
 * - Payment + AppUser repository
 * - MailModule (premium bitiş hatırlatma maili, Migration 034)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, AppUser]),
    ConfigModule,
    UserAuthModule,
    MailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsCronService, PremiumGuard],
  exports: [PaymentsService, PremiumGuard],
})
export class PaymentsModule {}
