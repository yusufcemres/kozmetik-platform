import { Body, Controller, Get, Ip, Post, Query, UseGuards, Req } from '@nestjs/common';
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
}
