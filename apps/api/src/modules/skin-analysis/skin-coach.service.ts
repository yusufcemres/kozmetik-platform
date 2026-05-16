import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SkinScoreBreakdown } from './dto/skin-analysis.dto';

/**
 * AI Cilt Danışmanı — analiz sonucu üzerine kullanıcı sorusu (Faz 2 #5 MVP).
 *
 * Backend: Claude messages API tek-shot (streaming değil, MVP için yeterli).
 * Vision API anahtarını paylaşıyor (ANTHROPIC_API_KEY). Premium feature
 * (49 TL/ay) — backend entitlement Faz 3'te, şimdilik frontend paywall.
 *
 * KVKK: sohbet metni saklamadan döner (best-effort log scope=ai_chat).
 */
@Injectable()
export class SkinCoachService {
  private readonly logger = new Logger(SkinCoachService.name);
  private readonly TIMEOUT_MS = 15_000;

  constructor(private readonly config: ConfigService) {}

  async askQuestion(
    scores: SkinScoreBreakdown,
    overall: number,
    question: string,
  ): Promise<{ answer: string; model: string }> {
    const trimmed = question.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      throw new ServiceUnavailableException('Soru 3-500 karakter arasında olmalı');
    }

    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI Danışman servisi yapılandırılmamış');
    }

    const systemPrompt = this.buildSystemPrompt(scores, overall);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.TIMEOUT_MS),
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: 'user', content: trimmed }],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Coach Claude ${res.status}: ${text.slice(0, 200)}`);
        throw new ServiceUnavailableException(
          'AI Danışman geçici olarak yanıt veremiyor. Birkaç dakika sonra dene.',
        );
      }
      const json = (await res.json()) as { content?: Array<{ text?: string }> };
      const answer = json?.content?.[0]?.text?.trim();
      if (!answer) {
        throw new ServiceUnavailableException('AI Danışman boş yanıt döndü');
      }
      return { answer, model: 'claude-sonnet-4-6' };
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.error(`Coach failed: ${err.message}`);
      throw new ServiceUnavailableException('AI Danışman ulaşılamadı');
    }
  }

  private buildSystemPrompt(scores: SkinScoreBreakdown, overall: number): string {
    const profile = [
      `T-bölge yağ: ${scores.t_zone_oil}/100`,
      `Gözenek görünürlüğü: ${scores.pore_visibility}/100`,
      `Kırışıklık: ${scores.wrinkles}/100`,
      `Leke: ${scores.pigmentation}/100`,
      `Kızarıklık: ${scores.redness}/100`,
      `Gözaltı moru: ${scores.under_eye_darkness}/100`,
      scores.acne_count != null ? `Aktif sivilce sayısı: ${scores.acne_count}` : '',
      scores.fitzpatrick_type != null ? `Cilt tonu (Fitzpatrick): ${scores.fitzpatrick_type}` : '',
      `Genel skor: ${overall}/100`,
    ]
      .filter(Boolean)
      .join('\n');

    return `Sen REVELA AI Cilt Danışmanısın. Türkiye merkezli kozmetik & cilt bakımı uygulamasındasın.

Kullanıcının cilt skorları (yüksek = daha şiddetli):
${profile}

KURALLAR (kritik):
1. SADECE yukarıdaki skorlara ve INCI/kozmetik bilgisine dayanarak yanıt ver
2. TIBBİ TANI KOYMA, "dermatologa başvur" gibi yönlendirme yap (ciddi sorunlarda)
3. Yanıtın Türkçe + samimi ama profesyonel olsun
4. 200 kelimeyi geçme, gereksiz uzatma
5. İlaç önerme — sadece INCI/ürün tipi/yöntem öner (örn. "Salisilik Asit içeren BHA tonik")
6. Garanti verme ("kesin geçer", "1 haftada düzelir" yasak)
7. Eğer soru kozmetik dışıysa (politika/finans/oyun) → "Sana sadece cilt analizinle ilgili yardım edebilirim" dön

Format: 2-4 paragraf. Madde işareti kullanabilirsin ama 5'i geçme.`;
  }
}
