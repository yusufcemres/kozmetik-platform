import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VisionResult {
  brand: string | null;
  product_name: string | null;
  product_type: string | null;
  detected_text: string | null;
  confidence: number; // 0-1
  raw?: string;
  /** Etiketten okunan INCI listesi (var ise). Smart-scan'de mevcut uruni enrich eder. */
  ingredients_list?: string[];
  /**
   * True ise hem Gemini hem Claude provider'a hiç ulaşılamadı (quota/auth/timeout).
   * Smart-scan service bunu yakalayıp 503 döner — "Ürün bulunamadı" yerine
   * "AI okuyucu geçici olarak kullanılamıyor" göster.
   */
  provider_unavailable?: boolean;
}

/** MIME types accepted by both Gemini Vision and Claude Vision endpoints. */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Empty/failure response shared by validation rejects and provider fallbacks. */
const EMPTY_VISION_RESULT: VisionResult = {
  brand: null,
  product_name: null,
  product_type: null,
  detected_text: null,
  confidence: 0,
};

/**
 * Vision API timeout. 2026-05-15 audit (Madde 9): Render cold start + Gemini/Claude
 * yavaş yanıtlarında smart-scan endpoint'i kilitlenmesin diye 12 saniye.
 * 12s = p99 vision yanıt süresinin yaklaşık 2x'i (tipik 3-5s).
 */
const VISION_TIMEOUT_MS = 12_000;

/**
 * Multi-modal vision: Gemini 2.0 Flash → Claude Sonnet fallback.
 * Accepts base64 image, returns structured product detection.
 *
 * Defense-in-depth: bu metod direkt çağrıldığında da MIME whitelist enforce eder
 * (DTO katmanı ilk savunma, bu ikinci savunma).
 */
@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);

  /**
   * Quota cooldown (2026-05-19): bir provider 429 alırsa N dakika boyunca
   * direkt skip → diğer provider'a geç. Aynı request'te bin retry yerine
   * sonraki request'lerde de bu provider'a hit atmamak için.
   * 5 dakika sonra reset (yeni quota window).
   */
  private quotaCooldown: Record<string, number> = {};
  private readonly COOLDOWN_MS = 5 * 60_000;

  constructor(private readonly config: ConfigService) {}

  private isInCooldown(provider: 'gemini' | 'claude' | 'openai'): boolean {
    const ts = this.quotaCooldown[provider];
    if (!ts) return false;
    if (Date.now() - ts > this.COOLDOWN_MS) {
      delete this.quotaCooldown[provider];
      return false;
    }
    return true;
  }

  private markCooldown(provider: 'gemini' | 'claude' | 'openai', reason: string): void {
    this.quotaCooldown[provider] = Date.now();
    this.logger.warn(`Vision provider '${provider}' cooldown 5dk (sebep: ${reason})`);
  }

  /**
   * 429/quota hata sinyali tespiti — provider error message'larında bu
   * pattern'ler quota tükendiğine işaret eder.
   */
  private isQuotaError(message: string): boolean {
    const lower = (message || '').toLowerCase();
    return lower.includes('429') ||
      lower.includes('quota') ||
      lower.includes('rate limit') ||
      lower.includes('rate_limit') ||
      lower.includes('limit exceeded') ||
      lower.includes('insufficient_quota');
  }

  async recognizeProduct(imageBase64: string, mimeType = 'image/jpeg'): Promise<VisionResult> {
    // Defense-in-depth MIME whitelist (DTO controller seviyesinde de enforce ediliyor)
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      this.logger.warn(`Reddedilen MIME type: ${mimeType}`);
      return EMPTY_VISION_RESULT;
    }

    // Strip data URI prefix if present (DTO base64'ü ham veya data URI kabul ediyor)
    const cleanBase64 = imageBase64.replace(/^data:image\/(jpeg|jpg|png|webp);base64,/, '');
    if (!cleanBase64) {
      this.logger.warn('Bos image_base64 reddedildi');
      return EMPTY_VISION_RESULT;
    }

    // Provider erişim durumunu izle: en az bir provider başarılı yanıt verdiyse
    // empty sonuç "okunamayan etiket" anlamına gelir; ikisi de fail olursa "AI offline".
    let geminiAttempted = false;
    let claudeAttempted = false;

    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    if (geminiKey && !this.isInCooldown('gemini')) {
      geminiAttempted = true;
      try {
        return await this.gemini(cleanBase64, mimeType, geminiKey);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('gemini', msg);
        this.logger.warn(`Gemini failed: ${msg}, trying Claude…`);
      }
    }

    const claudeKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (claudeKey && !this.isInCooldown('claude')) {
      claudeAttempted = true;
      try {
        return await this.claude(cleanBase64, mimeType, claudeKey);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('claude', msg);
        this.logger.error(`Claude vision failed: ${msg}`);
      }
    }

    // 3. provider — OpenAI vision (opsiyonel, OPENAI_API_KEY varsa aktif)
    const openaiKey = this.config.get<string>('OPENAI_API_KEY');
    if (openaiKey && !this.isInCooldown('openai')) {
      try {
        return await this.openai(cleanBase64, mimeType, openaiKey);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('openai', msg);
        this.logger.error(`OpenAI vision failed: ${msg}`);
      }
    }

    if (!geminiAttempted && !claudeAttempted && !openaiKey) {
      this.logger.error('Vision provider yapılandırılmamış: GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY yok');
    }
    return { ...EMPTY_VISION_RESULT, provider_unavailable: true };
  }

  /**
   * Genel Vision API çağrısı — caller kendi prompt'ını ve parse mantığını yönetir.
   *
   * 2026-05-16 Foto Analiz Faz 1 Gün 2 ile eklendi: skin-analysis modülü
   * kendi domain prompt'ıyla bu metodu çağırır (DRY — HTTP + timeout + MIME guard reuse).
   *
   * @returns Provider'ın döndüğü ham metin + kullanılan model versiyonu.
   *          Caller JSON parse ve domain-specific validation yapar.
   */
  async callVisionWithPrompt(
    imageBase64: string,
    mimeType: string,
    prompt: string,
  ): Promise<{ raw: string; model: string } | null> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      this.logger.warn(`callVisionWithPrompt reddedilen MIME: ${mimeType}`);
      return null;
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/(jpeg|jpg|png|webp);base64,/, '');
    if (!cleanBase64) return null;

    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    if (geminiKey && !this.isInCooldown('gemini')) {
      try {
        const raw = await this.geminiRaw(cleanBase64, mimeType, geminiKey, prompt);
        return { raw, model: 'gemini-2.0-flash' };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('gemini', msg);
        this.logger.warn(`Gemini failed (skin-prompt): ${msg}, trying Claude…`);
      }
    }

    const claudeKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (claudeKey && !this.isInCooldown('claude')) {
      try {
        const raw = await this.claudeRaw(cleanBase64, mimeType, claudeKey, prompt);
        return { raw, model: 'claude-sonnet-4-6' };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('claude', msg);
        this.logger.error(`Claude failed (skin-prompt): ${msg}`);
      }
    }

    const openaiKey = this.config.get<string>('OPENAI_API_KEY');
    if (openaiKey && !this.isInCooldown('openai')) {
      try {
        const raw = await this.openaiRaw(cleanBase64, mimeType, openaiKey, prompt);
        return { raw, model: 'gpt-4o-mini' };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (this.isQuotaError(msg)) this.markCooldown('openai', msg);
        this.logger.error(`OpenAI failed (skin-prompt): ${msg}`);
      }
    }
    return null;
  }

  /** Gemini API — custom prompt versiyonu */
  private async geminiRaw(image: string, mime: string, apiKey: string, prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime, data: image } },
          ],
        }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  }

  /**
   * OpenAI Vision (GPT-4o-mini) — 3. fallback provider.
   * Sadece OPENAI_API_KEY env var set ise aktif. JSON-only response için
   * response_format kullanır.
   */
  private async openai(image: string, mime: string, apiKey: string): Promise<VisionResult> {
    const raw = await this.openaiRaw(image, mime, apiKey, this.buildPrompt());
    try {
      const cleaned = raw.replace(/^```json\s*|\s*```$/gm, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        brand: parsed.brand || null,
        product_name: parsed.product_name || null,
        product_type: parsed.product_type || null,
        detected_text: parsed.detected_text || null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        ingredients_list: Array.isArray(parsed.ingredients_list) ? parsed.ingredients_list : undefined,
        raw,
      };
    } catch {
      return { ...EMPTY_VISION_RESULT, raw };
    }
  }

  private async openaiRaw(image: string, mime: string, apiKey: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${image}` } },
          ],
        }],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json?.choices?.[0]?.message?.content ?? '{}';
  }

  /** Claude API — custom prompt versiyonu */
  private async claudeRaw(image: string, mime: string, apiKey: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: image } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });
    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      content?: Array<{ text?: string }>;
    };
    return json?.content?.[0]?.text ?? '{}';
  }

  private buildPrompt(): string {
    return `Bu fotoğrafta bir kozmetik ürünü, gıda takviyesi veya cilt bakım ürünü olup olmadığına bak.

SADECE aşağıdaki JSON formatında cevap ver, başka hiçbir şey yazma:

{
  "brand": "marka adı veya null",
  "product_name": "ürün adı veya null",
  "product_type": "serum|krem|tonik|temizleyici|maske|vitamin|takviye|diğer veya null",
  "detected_text": "ambalajda gördüğün metinlerin özeti",
  "confidence": 0.0-1.0 arası güven skoru,
  "ingredients_list": ["INCI1", "INCI2", ...]
}

KRİTİK INGREDIENT KURALLARI:
1) SADECE FOTOĞRAFTA NET OKUYABİLDİĞİN INCI'leri yaz. Tahmin etme, hayal etme.
2) Bir INCI bulanık/silik/yarısı kesilmişse onu YAZMA.
3) Bir INCI 'İçindekiler' veya 'Ingredients' başlığı altında geçiyorsa yaz; başka yerde (reklam, claim, slogan) geçiyorsa YAZMA.
4) Aynı INCI'yi 2 kez yazma. Aynı kökten farklı versiyon (örn. PEG-40 ve PEG-60) sadece her ikisi de NET görünüyorsa yaz; tek görünüyorsa diğerini ekleme.
5) Yüzde işaretlerini, parantez içlerini ve dilbilgisi bağlaçlarını (ve, and) at.
6) Türkçe karakterleri (ş ç ğ ı ö ü) doğru yaz.
7) Eğer fotoğrafta INCI listesi yoksa veya net okuyamıyorsan, boş array [] döndür.

Emin değilsen null veya boş array döndür. Hallucinate etme.`;
  }

  private async gemini(image: string, mime: string, apiKey: string): Promise<VisionResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: this.buildPrompt() },
            { inline_data: { mime_type: mime, data: image } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return this.parseResult(text);
  }

  private async claude(image: string, mime: string, apiKey: string): Promise<VisionResult> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: image } },
            { type: 'text', text: this.buildPrompt() },
          ],
        }],
      }),
    });
    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      content?: Array<{ text?: string }>;
    };
    const text = json?.content?.[0]?.text ?? '{}';
    return this.parseResult(text);
  }

  private parseResult(text: string): VisionResult {
    try {
      const clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(clean);
      // ingredients_list parse + temizle
      let ings: string[] = [];
      if (Array.isArray(parsed.ingredients_list)) {
        ings = (parsed.ingredients_list as unknown[])
          .map((s) => String(s ?? '').trim().replace(/^["'`]+|["'`]+$/g, '').replace(/\([^)]*\)/g, '').replace(/\s*%?\s*\d+[.,]?\d*\s*%?\s*/g, ' ').trim())
          .filter((s: string) => s.length > 1 && s.length < 100)
          .slice(0, 100);
      }
      return {
        brand: parsed.brand ?? null,
        product_name: parsed.product_name ?? null,
        product_type: parsed.product_type ?? null,
        detected_text: parsed.detected_text ?? null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        raw: clean,
        ingredients_list: ings,
      };
    } catch {
      return {
        brand: null,
        product_name: null,
        product_type: null,
        detected_text: text.slice(0, 200),
        confidence: 0,
        raw: text,
        ingredients_list: [],
      };
    }
  }
}
