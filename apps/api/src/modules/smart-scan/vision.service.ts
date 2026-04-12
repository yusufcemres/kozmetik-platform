import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VisionResult {
  brand: string | null;
  product_name: string | null;
  product_type: string | null;
  detected_text: string | null;
  confidence: number; // 0-1
  raw?: string;
}

/**
 * Multi-modal vision: Gemini 2.0 Flash → Claude Haiku fallback.
 * Accepts base64 image, returns structured product detection.
 */
@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);

  constructor(private readonly config: ConfigService) {}

  async recognizeProduct(imageBase64: string, mimeType = 'image/jpeg'): Promise<VisionResult> {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        return await this.gemini(imageBase64, mimeType, geminiKey);
      } catch (err: any) {
        this.logger.warn(`Gemini failed: ${err.message}, trying Claude…`);
      }
    }

    const claudeKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (claudeKey) {
      try {
        return await this.claude(imageBase64, mimeType, claudeKey);
      } catch (err: any) {
        this.logger.error(`Claude vision failed: ${err.message}`);
      }
    }

    return {
      brand: null,
      product_name: null,
      product_type: null,
      detected_text: null,
      confidence: 0,
    };
  }

  private buildPrompt(): string {
    return `Bu fotoğrafta bir kozmetik ürünü, gıda takviyesi veya cilt bakım ürünü olup olmadığına bak.
Sadece aşağıdaki JSON formatında cevap ver, başka hiçbir şey yazma:

{
  "brand": "marka adı veya null",
  "product_name": "ürün adı veya null",
  "product_type": "serum|krem|tonik|temizleyici|maske|vitamin|takviye|diğer veya null",
  "detected_text": "ambalajda gördüğün metinlerin özeti",
  "confidence": 0.0-1.0 arası güven skoru
}

Emin değilsen null döndür. Türkçe marka/ürün adı olabilir, olduğu gibi yaz.`;
  }

  private async gemini(image: string, mime: string, apiKey: string): Promise<VisionResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const json: any = await res.json();
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
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
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
    const json: any = await res.json();
    const text = json?.content?.[0]?.text ?? '{}';
    return this.parseResult(text);
  }

  private parseResult(text: string): VisionResult {
    try {
      // Strip markdown fences if model adds them
      const clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        brand: parsed.brand ?? null,
        product_name: parsed.product_name ?? null,
        product_type: parsed.product_type ?? null,
        detected_text: parsed.detected_text ?? null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        raw: clean,
      };
    } catch {
      return {
        brand: null,
        product_name: null,
        product_type: null,
        detected_text: text.slice(0, 200),
        confidence: 0,
        raw: text,
      };
    }
  }
}
