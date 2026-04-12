import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get('public-key')
  @ApiOperation({ summary: 'VAPID public key' })
  getPublicKey() {
    return { public_key: this.service.getPublicKey() };
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Push subscription kaydet' })
  async subscribe(
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string }; user_agent?: string },
    @Req() req: any,
  ) {
    return this.service.subscribe({
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      user_id: req?.user?.user_id,
      user_agent: body.user_agent,
    });
  }

  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Push subscription iptal' })
  async unsubscribe(@Body() body: { endpoint: string }) {
    return this.service.unsubscribe(body.endpoint);
  }

  @Post('test')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kendine test push gönder' })
  async testPush(@Req() req: any) {
    const sent = await this.service.sendToUser(req.user.user_id, {
      title: 'REVELA Test',
      body: 'Bildirimler çalışıyor! 🎉',
      url: '/profilim',
    });
    return { sent };
  }
}
