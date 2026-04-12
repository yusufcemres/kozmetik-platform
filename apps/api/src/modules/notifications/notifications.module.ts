import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushSubscription } from '@database/entities';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription]),
    UserAuthModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
