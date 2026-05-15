import { Body, Controller, Get, Headers, Ip, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkinAnalysisService } from './skin-analysis.service';
import { SkinAnalysisRequestDto } from './dto/skin-analysis.dto';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';

/**
 * Foto Analiz (Cilt Sağlığı) endpoint'leri.
 *
 * 2026-05-16 Faz 1 Gün 1 — POST /skin-analysis (ücretsiz tier) + GET /me/history (premium).
 * Rate limit: ücretsiz 3/dakika (foto upload yavaş, abuse koruması).
 */
@ApiTags('Skin Analysis')
@Controller('skin-analysis')
export class SkinAnalysisController {
  constructor(private readonly service: SkinAnalysisService) {}

  @Post()
  @Throttle({ public: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Yüz fotoğrafını analiz et (6-boyut skor + INCI önerisi)' })
  async analyze(
    @Body() body: SkinAnalysisRequestDto,
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') ua?: string,
    @Query('email') email?: string,
  ) {
    const user_id = req?.user?.user_id;
    return this.service.analyze(body, { user_id, ip, user_agent: ua, email });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek analiz sonucu' })
  async getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req?.user?.user_id;
    return this.service.getById(id, userId);
  }

  @Get('me/history')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanıcı analiz geçmişi (trend takibi)' })
  async myHistory(@Req() req: any, @Query('limit') limit?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100);
    return this.service.getUserHistory(req.user.user_id, lim);
  }
}
