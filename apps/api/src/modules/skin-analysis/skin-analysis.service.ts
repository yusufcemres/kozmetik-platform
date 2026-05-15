import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { SkinAnalysisResult } from '@database/entities';
import { VisionService } from '../smart-scan/vision.service';
import { SkinAnalysisRequestDto, SkinAnalysisResponse, SkinScoreBreakdown } from './dto/skin-analysis.dto';

/**
 * Foto analiz iş mantığı.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 1 — iskelet (Gün 2'de skin-vision prompt eklenecek).
 *
 * Akış:
 * 1. DTO validate (controller) → service'e gel
 * 2. Vision API (Gemini → Claude fallback) — Gün 2'de skin-specific prompt
 * 3. Skor JSON parse + sanitize
 * 4. Overall skor hesapla (ağırlıklı ortalama)
 * 5. INCI öneri üret (boyut → top 3 INCI, mevcut REVELA veritabanından)
 * 6. DB'ye kaydet (foto sadece opt-in)
 * 7. Response dön
 */
@Injectable()
export class SkinAnalysisService {
  private readonly logger = new Logger(SkinAnalysisService.name);

  /** 6-boyut skoru → genel skora çevirirken kullanılan ağırlıklar (toplam 1.0) */
  private readonly DIMENSION_WEIGHTS: Record<keyof SkinScoreBreakdown, number> = {
    t_zone_oil: 0.15,
    pore_visibility: 0.15,
    wrinkles: 0.20,
    pigmentation: 0.20,
    redness: 0.15,
    under_eye_darkness: 0.15,
    acne_count: 0, // Bonus, ağırlığa katılmaz
    fitzpatrick_type: 0, // Sınıflandırma, skor değil
  };

  /** Her boyut için top INCI önerileri (Gün 2-3'te REVELA DB'den dinamik üretilecek, şu an statik) */
  private readonly DIMENSION_INCI_MAP: Record<string, string[]> = {
    t_zone_oil: ['Niacinamide', 'Salicylic Acid (BHA)', 'Zinc PCA'],
    pore_visibility: ['Niacinamide', 'Salicylic Acid (BHA)', 'Retinol'],
    wrinkles: ['Retinol', 'Palmitoyl Pentapeptide-4', 'Vitamin C'],
    pigmentation: ['Niacinamide', 'Vitamin C', 'Alpha Arbutin', 'Tranexamic Acid'],
    redness: ['Centella Asiatica', 'Allantoin', 'Panthenol', 'Bisabolol'],
    under_eye_darkness: ['Caffeine', 'Vitamin K', 'Peptides', 'Niacinamide'],
    acne_count: ['Salicylic Acid (BHA)', 'Niacinamide', 'Tea Tree Oil', 'Azelaic Acid'],
    fitzpatrick_type: [], // Sınıflandırma → öneri yok
  };

  constructor(
    @InjectRepository(SkinAnalysisResult)
    private readonly results: Repository<SkinAnalysisResult>,
    private readonly vision: VisionService,
  ) {}

  async analyze(
    dto: SkinAnalysisRequestDto,
    context: { user_id?: number; ip?: string; user_agent?: string; email?: string } = {},
  ): Promise<SkinAnalysisResponse> {
    // Gerçek vision çağrısı — başarısızsa BadRequest (cilt analizinde "hayal etme" politikası,
    // placeholder skor kullanıcıya verilmemeli)
    const visionResult = await this.vision.callVisionWithPrompt(
      dto.image_base64,
      dto.image_mime,
      this.buildSkinPrompt(),
    );

    if (!visionResult) {
      throw new BadRequestException(
        'Cilt analizi şu an yapılamıyor — Vision servisi yanıt vermedi. Lütfen tekrar dene.',
      );
    }

    const scores = this.parseSkinJSON(visionResult.raw);
    if (!scores) {
      throw new BadRequestException(
        'Fotoğraf analiz edilemedi — yüz net görünmüyor olabilir. Daha iyi ışıkta tekrar dene.',
      );
    }

    const overall_score = this.calculateOverall(scores);
    const recommendations = this.buildRecommendations(scores);

    const saved = await this.results.save(
      this.results.create({
        user_id: context.user_id ?? null,
        anonymous_email: context.email ? createHash('sha256').update(context.email.toLowerCase()).digest('hex') : null,
        scores,
        overall_score,
        recommendations,
        guard_score: dto.guard_score ?? null,
        model_version: `${visionResult.model}-skin-v1`,
        photo_blob: dto.store_photo ? dto.image_base64 : null,
        ip: context.ip ?? null,
        user_agent: context.user_agent ? context.user_agent.slice(0, 255) : null,
      }),
    );

    return {
      scores,
      overall_score,
      recommendations: recommendations as Record<keyof SkinScoreBreakdown, string[]>,
      model_version: saved.model_version,
      analysis_id: Number(saved.analysis_id),
      created_at: saved.created_at.toISOString(),
    };
  }

  /**
   * Skin-specific Türkçe Vision prompt — 6-boyut skor JSON çıktısı için.
   *
   * Kritik kurallar (Madde 5 disclaimer + Quantum Orbit "hallucinate etme" prensibi):
   * - Yüz net görünmüyorsa null döndür (placeholder skor verme)
   * - Tıbbi tanı koyma, sadece görsel gözlemle skorla
   * - Skor 0-100 (yüksek = daha şiddetli)
   */
  private buildSkinPrompt(): string {
    return `Bu fotoğrafta bir kullanıcının yüzü var. Yüzünün cilt durumunu analiz et.

ÖNEMLİ: Bu bir TIBBİ TANI DEĞİL, görsel cilt gözlemi. Sadece fotoğrafta NET görebildiğin belirtileri skorla, hayal etme.

Eğer fotoğrafta:
- Yüz net görünmüyorsa
- Çok bulanıksa veya çok karanlıksa
- Yüz değil başka bir nesne ise
- Birden fazla yüz varsa

cevabı şöyle döndür: {"error": "face_not_detected"}

Aksi halde, SADECE aşağıdaki JSON formatında cevap ver (başka hiçbir metin yazma):

{
  "t_zone_oil": 0-100 arası tamsayı (T-bölgesinde — alın+burun — yağlanma/parlama şiddeti, 0=hiç yağlı değil, 100=çok yağlı),
  "pore_visibility": 0-100 (gözenek görünürlüğü, özellikle burun ve yanak; 0=görünmez, 100=çok belirgin),
  "wrinkles": 0-100 (kırışıklık ve ince çizgi şiddeti, alın+göz çevresi+ağız; 0=hiç yok, 100=derin),
  "pigmentation": 0-100 (leke/hiperpigmentasyon şiddeti; 0=eşit ton, 100=yoğun leke),
  "redness": 0-100 (kızarıklık/inflamasyon şiddeti, yanak+burun çevresi; 0=hiç, 100=yaygın),
  "under_eye_darkness": 0-100 (gözaltı moru/koyuluk şiddeti; 0=normal, 100=çok belirgin),
  "acne_count": 0-50 (aktif sivilce/akne sayısı; sayamıyorsan tahmini ver),
  "fitzpatrick_type": 1-6 (cilt tonu sınıfı: 1=çok açık, 6=çok koyu)
}

Şüphedeysen orta değer (40-60) ver. Hayal etme. Sayısal olmayan değer döndürme.`;
  }

  /**
   * Vision JSON çıktısını parse + sanitize.
   * Hatalı JSON, missing key, range dışı değerler → null döner (caller user-friendly hata göstersin).
   */
  private parseSkinJSON(raw: string): SkinScoreBreakdown | null {
    try {
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.error === 'face_not_detected') return null;

      const clamp = (v: unknown, max = 100): number => {
        const n = Number(v);
        if (!Number.isFinite(n)) return 50; // Default orta değer
        return Math.max(0, Math.min(max, Math.round(n)));
      };

      return {
        t_zone_oil: clamp(parsed.t_zone_oil),
        pore_visibility: clamp(parsed.pore_visibility),
        wrinkles: clamp(parsed.wrinkles),
        pigmentation: clamp(parsed.pigmentation),
        redness: clamp(parsed.redness),
        under_eye_darkness: clamp(parsed.under_eye_darkness),
        acne_count: parsed.acne_count != null ? clamp(parsed.acne_count, 50) : undefined,
        fitzpatrick_type: parsed.fitzpatrick_type != null ? clamp(parsed.fitzpatrick_type, 6) : undefined,
      };
    } catch (err: any) {
      this.logger.warn(`parseSkinJSON failed: ${err.message}, raw: ${raw.slice(0, 200)}`);
      return null;
    }
  }

  private calculateOverall(scores: SkinScoreBreakdown): number {
    let sum = 0;
    let weightSum = 0;
    for (const [dim, weight] of Object.entries(this.DIMENSION_WEIGHTS) as Array<[keyof SkinScoreBreakdown, number]>) {
      if (weight === 0) continue;
      const score = scores[dim];
      if (typeof score !== 'number') continue;
      sum += score * weight;
      weightSum += weight;
    }
    return weightSum > 0 ? Math.round(sum / weightSum) : 0;
  }

  private buildRecommendations(scores: SkinScoreBreakdown): Record<string, string[]> {
    const recs: Record<string, string[]> = {};
    for (const [dim, list] of Object.entries(this.DIMENSION_INCI_MAP)) {
      const score = scores[dim as keyof SkinScoreBreakdown];
      // Sadece "sorunlu" boyutlar için öneri (≥40 skor)
      if (typeof score === 'number' && score >= 40 && list.length > 0) {
        recs[dim] = list.slice(0, 3); // Top 3
      }
    }
    return recs;
  }

  async getById(analysisId: number, userId?: number): Promise<SkinAnalysisResult | null> {
    const where = userId
      ? { analysis_id: String(analysisId), user_id: userId }
      : { analysis_id: String(analysisId) };
    return this.results.findOne({ where: where as any });
  }

  async getUserHistory(userId: number, limit = 20): Promise<SkinAnalysisResult[]> {
    return this.results.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }
}
