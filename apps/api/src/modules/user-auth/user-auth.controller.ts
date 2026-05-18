import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserAuthService } from './user-auth.service';
import { AppJwtGuard } from './app-jwt.guard';

class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ada Lovelace', description: 'Görünür isim (max 100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  display_name?: string | null;
}

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
  async verify(@Query('token') token: string, @Ip() ip: string) {
    return this.service.verifyMagicLink(token, ip);
  }

  /**
   * Google OAuth login — frontend Google Identity Services'ten id_token alır,
   * burada server-side verify edilir. JWT döner (magic link ile aynı format).
   */
  @Post('google')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Google ile giriş (id_token doğrula → JWT)' })
  async loginGoogle(
    @Body() body: { id_token?: string; credential?: string },
    @Ip() ip: string,
    @Headers('user-agent') ua?: string,
  ) {
    const token = body?.id_token || body?.credential; // GIS button "credential" anahtarı kullanıyor
    if (!token) throw new BadRequestException('id_token veya credential zorunlu');
    return this.service.loginWithGoogle(token, { ip, user_agent: ua });
  }

  /**
   * Facebook OAuth login — frontend FB SDK'sından access_token alır.
   * Backend graph.facebook.com ile debug_token + me doğrular.
   */
  @Post('facebook')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Facebook ile giriş (access_token doğrula → JWT)' })
  async loginFacebook(
    @Body() body: { access_token?: string },
    @Ip() ip: string,
    @Headers('user-agent') ua?: string,
  ) {
    if (!body?.access_token) throw new BadRequestException('access_token zorunlu');
    return this.service.loginWithFacebook(body.access_token, { ip, user_agent: ua });
  }

  @Get('me')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Mevcut kullanıcı bilgisi' })
  async me(@Req() req: any) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Profil bilgisini güncelle (display_name)' })
  async updateMe(@Req() req: any, @Body() body: UpdateProfileDto, @Ip() ip: string) {
    return this.service.updateProfile(req.user.user_id, body, ip);
  }

  @Get('me/export')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'KVKK: tüm kullanıcı verilerini JSON olarak indir' })
  async exportMe(@Req() req: any, @Ip() ip: string) {
    return this.service.exportUserData(req.user.user_id, ip);
  }

  @Delete('me')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'KVKK: hesabı ve tüm ilişkili verileri sil' })
  async deleteMe(@Req() req: any, @Ip() ip: string) {
    return this.service.deleteAccount(req.user.user_id, ip);
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
