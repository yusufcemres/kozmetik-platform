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

  /**
   * Single-turn (backward compat). Yeni client multi-turn için askWithHistory
   * çağırmalı.
   */
  async askQuestion(
    scores: SkinScoreBreakdown,
    overall: number,
    question: string,
  ): Promise<{ answer: string; model: string }> {
    return this.askWithHistory(scores, overall, [], question);
  }

  /**
   * Multi-turn — kullanıcı sohbet geçmişini dizi olarak yollar, biz
   * Claude'a system + previous turns + current question olarak iletiriz.
   *
   * Frontend localStorage'da history tutar (KVKK: backend saklamaz).
   * Max 10 turn (5 user + 5 assistant) limiti, token israfını önler.
   */
  /**
   * Streaming versiyon — Anthropic stream:true ile NDJSON event tüketir,
   * her text delta için callback çağırır. Controller @Res() ile SSE
   * yazıyor (text/event-stream).
   */
  async streamWithHistory(
    scores: SkinScoreBreakdown,
    overall: number,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentQuestion: string,
    onChunk: (text: string) => void,
  ): Promise<{ model: string; totalChars: number }> {
    const trimmed = currentQuestion.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      throw new ServiceUnavailableException('Soru 3-500 karakter arasında olmalı');
    }
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI Danışman servisi yapılandırılmamış');
    }

    const cleanHistory = (Array.isArray(history) ? history : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let lastRole: 'user' | 'assistant' | null = null;
    for (const m of cleanHistory) {
      if (lastRole === m.role) continue;
      messages.push(m);
      lastRole = m.role;
    }
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      messages.pop();
    }
    messages.push({ role: 'user', content: trimmed });

    const systemPrompt = this.buildSystemPrompt(scores, overall);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.TIMEOUT_MS * 2), // Stream daha uzun sürebilir
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Coach stream Claude ${res.status}: ${text.slice(0, 200)}`);
      throw new ServiceUnavailableException(
        'AI Danışman geçici olarak yanıt veremiyor. Birkaç dakika sonra dene.',
      );
    }

    // Anthropic SSE format: "event: <type>\ndata: <json>\n\n"
    // text delta: { type: 'content_block_delta', delta: { type: 'text_delta', text: '...' } }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalChars = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE event'leri "\n\n" ile ayrılır
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const ev of events) {
          if (!ev.trim()) continue;
          const dataLine = ev.split('\n').find((l) => l.startsWith('data: '));
          if (!dataLine) continue;
          const json = dataLine.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed?.type === 'content_block_delta' && parsed?.delta?.type === 'text_delta') {
              const chunk = parsed.delta.text || '';
              if (chunk) {
                onChunk(chunk);
                totalChars += chunk.length;
              }
            }
          } catch {
            // JSON parse hatası — skip, kontrolsüz event olabilir
          }
        }
      }
    } finally {
      try { reader.releaseLock(); } catch {}
    }

    return { model: 'claude-sonnet-4-6', totalChars };
  }

  async askWithHistory(
    scores: SkinScoreBreakdown,
    overall: number,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentQuestion: string,
  ): Promise<{ answer: string; model: string }> {
    const trimmed = currentQuestion.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      throw new ServiceUnavailableException('Soru 3-500 karakter arasında olmalı');
    }

    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI Danışman servisi yapılandırılmamış');
    }

    // History sanitize: maks 10 turn, her biri max 1000 char, role/content valid
    const cleanHistory = (Array.isArray(history) ? history : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

    // Alternating turn kontrolü: Claude messages array user/assistant alternasyon ister
    // Eğer son turn user ile bitiyorsa atla (yeni soru zaten user) — assistant ile bitmeli
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let lastRole: 'user' | 'assistant' | null = null;
    for (const m of cleanHistory) {
      if (lastRole === m.role) continue; // duplicate role atla
      messages.push(m);
      lastRole = m.role;
    }
    // Eğer history user ile bitiyorsa son user'ı düşür (yeni question zaten gelecek)
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      messages.pop();
    }
    messages.push({ role: 'user', content: trimmed });

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
          messages,
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
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.error(`Coach failed: ${err instanceof Error ? err.message : err}`);
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
