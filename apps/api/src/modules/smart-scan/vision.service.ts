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
    const json: any = await res.json();
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
        ings = parsed.ingredients_list
          .map((s: any) => String(s || '').trim().replace(/^["'`]+|["'`]+$/g, '').replace(/\([^)]*\)/g, '').replace(/\s*%?\s*\d+[.,]?\d*\s*%?\s*/g, ' ').trim())
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
