import { BadRequestException, Body, Controller, Delete, Get, Headers, Ip, NotFoundException, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { SkinAnalysisService } from './skin-analysis.service';
import { SkinCoachService } from './skin-coach.service';
import { SkinAnalysisRequestDto } from './dto/skin-analysis.dto';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';
import type { AppAuthRequest, AppMaybeAuthRequest } from '../user-auth/app-auth-request';

/**
 * Foto Analiz (Cilt Sağlığı) endpoint'leri.
 *
 * 2026-05-16 Faz 1 Gün 1 — POST /skin-analysis (ücretsiz tier) + GET /me/history (premium).
 * Rate limit: ücretsiz 3/dakika (foto upload yavaş, abuse koruması).
 */
@ApiTags('Skin Analysis')
@Controller('skin-analysis')
export class SkinAnalysisController {
  constructor(
    private readonly service: SkinAnalysisService,
    private readonly coach: SkinCoachService,
  ) {}

  @Post()
  @Throttle({ public: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Yüz fotoğrafını analiz et (6-boyut skor + INCI önerisi)' })
  async analyze(
    @Body() body: SkinAnalysisRequestDto,
    @Req() req: AppMaybeAuthRequest,
    @Ip() ip: string,
    @Headers('user-agent') ua?: string,
    @Query('email') email?: string,
  ) {
    const user_id = req?.user?.user_id;
    return this.service.analyze(body, { user_id, ip, user_agent: ua, email });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek analiz sonucu' })
  async getOne(@Param('id', ParseIntPipe) id: number, @Req() req: AppMaybeAuthRequest) {
    const userId = req?.user?.user_id;
    return this.service.getById(id, userId);
  }

  @Get('me/history')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanıcı analiz geçmişi (trend takibi)' })
  async myHistory(@Req() req: AppAuthRequest, @Query('limit') limit?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100);
    return this.service.getUserHistory(req.user.user_id, lim);
  }

  /**
   * Faz 2 — eski analiz vs yeni analiz karşılaştırma.
   * `to` zorunlu (yeni analiz id), `from` opsiyonel (otomatik bir önceki).
   */
  @Get('me/compare')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'İki analizi karşılaştır — trend grafiği için' })
  async compareMine(
    @Req() req: AppAuthRequest,
    @Query('to') to: string,
    @Query('from') from?: string,
  ) {
    const toId = parseInt(to ?? '', 10);
    if (!Number.isFinite(toId)) throw new BadRequestException('"to" query parametre sayısal olmalı');
    const fromId = from ? parseInt(from, 10) : undefined;
    if (from && !Number.isFinite(fromId)) throw new BadRequestException('"from" geçersiz');
    return this.service.compareForUser(req.user.user_id, toId, fromId);
  }

  /**
   * Anonim compare — 28-gün reminder email'deki unsubscribe_token ile auth'suz erişim.
   * Token aynı email'in tüm analizlerine bağlı; cross-user data leak yok.
   */
  @Get('compare-by-token/:token')
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reminder email token ile karşılaştırma (auth\'suz)' })
  async compareByToken(@Param('token') token: string, @Query('to') to?: string) {
    const toId = to ? parseInt(to, 10) : undefined;
    if (to && !Number.isFinite(toId)) throw new BadRequestException('"to" geçersiz');
    return this.service.compareByToken(token, toId);
  }

  /**
   * Anonim tam geçmiş — reminder token ile auth'suz tüm analizler.
   * Faz 2 #2 trend history chart için.
   */
  @Get('history-by-token/:token')
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reminder email token ile geçmiş analizler (auth\'suz)' })
  async historyByToken(@Param('token') token: string, @Query('limit') limit?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 50);
    return this.service.getHistoryByToken(token, lim);
  }

  /**
   * Faz 2 #5 — AI Cilt Danışmanı sohbet (Premium feature, 49 TL/ay).
   * Backend entitlement henüz yok (Faz 3'te); şimdilik anyone'a açık ama
   * frontend paywall ile sınırlı.
   */
  @Post(':id/coach')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'AI Cilt Danışmanı — analiz skoru üzerine soru sor (multi-turn destekli)' })
  async coachAsk(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ) {
    if (!body?.question || typeof body.question !== 'string') {
      throw new BadRequestException('question alanı zorunlu');
    }
    const analysis = await this.service.getById(id);
    if (!analysis) throw new NotFoundException('Analiz bulunamadı');
    return this.coach.askWithHistory(
      analysis.scores,
      analysis.overall_score,
      body.history ?? [],
      body.question,
    );
  }

  /**
   * Streaming versiyon — text/event-stream ile chunk chunk yanıt.
   * Frontend `fetch + body.getReader()` ile tüketir.
   */
  @Post(':id/coach/stream')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'AI Cilt Danışmanı — streaming yanıt (SSE)' })
  async coachStream(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
    @Res() res: Response,
  ): Promise<void> {
    if (!body?.question || typeof body.question !== 'string') {
      throw new BadRequestException('question alanı zorunlu');
    }
    const analysis = await this.service.getById(id);
    if (!analysis) throw new NotFoundException('Analiz bulunamadı');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // nginx proxy buffering kapat
    res.flushHeaders?.();

    try {
      const result = await this.coach.streamWithHistory(
        analysis.scores,
        analysis.overall_score,
        body.history ?? [],
        body.question,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        },
      );
      res.write(`data: ${JSON.stringify({ type: 'done', model: result.model, totalChars: result.totalChars })}\n\n`);
    } catch (err: any) {
      const message = err?.message || 'AI Danışman ulaşılamadı';
      res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    } finally {
      res.end();
    }
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
  async exportMine(@Req() req: AppAuthRequest, @Ip() ip: string, @Headers('user-agent') ua?: string) {
    return this.service.exportForUser(req.user.user_id, { ip, user_agent: ua });
  }

  @Delete('me/delete-all')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'KVKK Madde 11(e+f) — tüm cilt analizi kayıtlarını sil' })
  async deleteMine(@Req() req: AppAuthRequest, @Ip() ip: string, @Headers('user-agent') ua?: string) {
    return this.service.deleteAllForUser(req.user.user_id, { ip, user_agent: ua });
  }
}
