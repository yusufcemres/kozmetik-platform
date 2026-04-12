import { Body, Controller, Get, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SmartScanService, SmartScanRequest } from './smart-scan.service';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';

@ApiTags('Smart Scan')
@Controller('smart-scan')
export class SmartScanController {
  constructor(private readonly service: SmartScanService) {}

  @Post()
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Barkod/görsel tara' })
  async scan(@Body() body: SmartScanRequest, @Req() req: any, @Ip() ip: string) {
    // Optional auth: if token present, attach user_id
    const userId = req?.user?.user_id;
    return this.service.scan({ ...body, user_id: userId, ip });
  }

  @Get('history')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanıcı tarama geçmişi' })
  async history(@Req() req: any) {
    return this.service.getUserHistory(req.user.user_id);
  }
}
