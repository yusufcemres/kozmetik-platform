import { BadRequestException, Body, Controller, Get, Header, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SmartScanService } from './smart-scan.service';
import { SmartScanRequestDto } from './dto/scan.dto';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';
import type { AppAuthRequest, AppMaybeAuthRequest } from '../user-auth/app-auth-request';

@ApiTags('Smart Scan')
@Controller('smart-scan')
export class SmartScanController {
  constructor(private readonly service: SmartScanService) {}

  @Post()
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Barkod/görsel tara' })
  async scan(@Body() body: SmartScanRequestDto, @Req() req: AppMaybeAuthRequest, @Ip() ip: string) {
    if (!body.barcode && !body.image_base64) {
      throw new BadRequestException('barcode veya image_base64 alanlarından en az biri gerekli');
    }
    // Optional auth: if token present, attach user_id
    const userId = req?.user?.user_id;
    return this.service.scan({ ...body, user_id: userId, ip });
  }

  @Get('history')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanıcı tarama geçmişi' })
  async history(@Req() req: AppAuthRequest) {
    return this.service.getUserHistory(req.user.user_id);
  }

  @Get('stats')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Topluluk tarama istatistigi (public sosyal kanit, CDN cached 5dk)' })
  async stats() {
    return this.service.getPublicStats();
  }
}
