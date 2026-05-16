import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
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

  // ---- Email funnel (Faz 1 Gün 9) ----

  @Post(':id/subscribe')
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Analiz sonucu email opt-in (welcome + 28-gün reminder)' })
  async subscribe(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { email?: string },
  ) {
    if (!body?.email || typeof body.email !== 'string') {
      throw new BadRequestException('email zorunlu');
    }
    return this.service.subscribeToEmail(id, body.email);
  }

  /**
   * Tek tıkla opt-out — email içindeki link doğrudan bu GET'i çağırır.
   * Token enumeration'a karşı: bilinmeyen token da success döner.
   */
  @Get('unsubscribe/:token')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: '28-gün reminder abonelik iptali (tek tıkla)' })
  async unsubscribe(@Param('token') token: string) {
    return this.service.unsubscribeByToken(token);
  }

  // ---- KVKK Madde 11 — Veri Hakları (Faz 1 Gün 10) ----

  @Get('me/export')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'KVKK Madde 11(d) — analiz verilerini JSON export et' })
  async exportMine(@Req() req: any, @Ip() ip: string, @Headers('user-agent') ua?: string) {
    return this.service.exportForUser(req.user.user_id, { ip, user_agent: ua });
  }

  @Delete('me/delete-all')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'KVKK Madde 11(e+f) — tüm cilt analizi kayıtlarını sil' })
  async deleteMine(@Req() req: any, @Ip() ip: string, @Headers('user-agent') ua?: string) {
    return this.service.deleteAllForUser(req.user.user_id, { ip, user_agent: ua });
  }
}
