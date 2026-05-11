import { Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserAuthService } from './user-auth.service';
import { AppJwtGuard } from './app-jwt.guard';

@ApiTags('User Auth')
@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly service: UserAuthService) {}

  @Post('request')
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Magic link e-postası iste' })
  async request(@Body() body: { email: string }, @Ip() ip: string) {
    return this.service.requestMagicLink(body?.email ?? '', ip);
  }

  @Get('verify')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Magic link token doğrula, JWT döndür' })
  async verify(@Query('token') token: string) {
    return this.service.verifyMagicLink(token);
  }

  @Get('me')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Mevcut kullanıcı bilgisi' })
  async me(@Req() req: any) {
    return req.user;
  }

  @Get('me/export')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'KVKK: tüm kullanıcı verilerini JSON olarak indir' })
  async exportMe(@Req() req: any) {
    return this.service.exportUserData(req.user.user_id);
  }

  @Delete('me')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'KVKK: hesabı ve tüm ilişkili verileri sil' })
  async deleteMe(@Req() req: any) {
    return this.service.deleteAccount(req.user.user_id);
  }

  @Get('me/scan-history')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanicinin tarama gecmisi (urun JOIN dahil)' })
  async myScanHistory(@Req() req: any, @Query('limit') limit?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '50', 10) || 50, 1), 200);
    return this.service.getScanHistory(req.user.user_id, lim);
  }

  @Get('me/scan-stats')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanicinin tarama ozeti (toplam, bu ay, Pioner)' })
  async myScanStats(@Req() req: any) {
    return this.service.getScanStats(req.user.user_id);
  }

  @Delete('me/scan-history/:historyId')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Tek tarama gecmisini sil' })
  async deleteScan(@Req() req: any, @Param('historyId', ParseIntPipe) historyId: number) {
    return this.service.deleteScan(req.user.user_id, historyId);
  }
}
