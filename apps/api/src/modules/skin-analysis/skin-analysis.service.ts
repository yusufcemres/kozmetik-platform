import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThan, Not, Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { SkinAnalysisResult, UserAction, UserActionType } from '@database/entities';
import { VisionService } from '../smart-scan/vision.service';
import { MailService } from '../../common/mail/mail.service';
import {
  IngredientRecommendation,
  SkinAnalysisRequestDto,
  SkinAnalysisResponse,
  SkinScoreBreakdown,
} from './dto/skin-analysis.dto';

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
    @InjectRepository(UserAction)
    private readonly userActions: Repository<UserAction>,
    private readonly vision: VisionService,
    private readonly dataSource: DataSource,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * KVKK Madde 8 audit log — fail silent (kullanıcı flow'u kesilmesin).
   * user-auth.service.ts'teki audit() ile aynı pattern.
   */
  private async audit(
    action_type: UserActionType,
    params: { user_id?: number | null; email?: string; ip?: string; user_agent?: string; details?: Record<string, unknown> } = {},
  ): Promise<void> {
    try {
      const email_hash = params.email
        ? createHash('sha256').update(params.email.toLowerCase().trim()).digest('hex')
        : null;
      await this.userActions.save(
        this.userActions.create({
          user_id: params.user_id ?? null,
          action_type,
          email_hash,
          ip: params.ip ?? null,
          user_agent: params.user_agent ? params.user_agent.slice(0, 255) : null,
          details: params.details ?? null,
        }),
      );
    } catch (err: any) {
      this.logger.warn(`audit log failed: ${err.message}`);
    }
  }

  /**
   * Enriched recommendations cache — DIMENSION_INCI_MAP statik olduğu için
   * SQL sonucu uzun süre değişmiyor. Process boyu cache (1 saat TTL).
   * (CacheService Redis ile yer kazandırırdı ama bu modüle eklemeden process-local yeterli.)
   */
  private recommendationsCache: { value: Record<string, IngredientRecommendation[]> | null; ts: number } = {
    value: null,
    ts: 0,
  };
  private readonly REC_CACHE_TTL = 60 * 60 * 1000;

  async analyze(
    dto: SkinAnalysisRequestDto,
    context: { user_id?: number; ip?: string; user_agent?: string; email?: string } = {},
  ): Promise<SkinAnalysisResponse> {
    // KVKK Madde 8 — açık rıza audit log (her analiz için, versiyon değişikliği denetlenir).
    void this.audit('CONSENT_UPDATE', {
      user_id: context.user_id ?? null,
      email: context.email,
      ip: context.ip,
      user_agent: context.user_agent,
      details: {
        scope: 'skin_analysis_biometric',
        consent_version: dto.consent_version,
        photo_storage_opt_in: !!dto.store_photo,
      },
    });

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
    // Day 8: enriched recommendations (ingredient metadata + REVELA ürünleri).
    // DB lookup fail olursa eski statik fallback'e düşer — analiz bozulmaz.
    const recommendations = await this.buildEnrichedRecommendations(scores).catch((err) => {
      this.logger.warn(`Enriched recommendations failed, fallback to static: ${err.message}`);
      return this.buildStaticFallbackRecommendations(scores);
    });

    const saved = await this.results.save(
      this.results.create({
        user_id: context.user_id ?? null,
        anonymous_email: context.email ? createHash('sha256').update(context.email.toLowerCase()).digest('hex') : null,
        scores,
        overall_score,
        // DB JSON column'una display_name + ingredient_id mapping kaydederiz —
        // tam product listesi cache-bound, her gösterimde taze çekilir.
        recommendations: this.compactRecommendationsForStorage(recommendations),
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
      recommendations,
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

  /** Fallback — DB lookup başarısızsa kullanıcı yine de INCI önerisi görür. */
  private buildStaticFallbackRecommendations(scores: SkinScoreBreakdown): Record<string, IngredientRecommendation[]> {
    const recs: Record<string, IngredientRecommendation[]> = {};
    for (const [dim, list] of Object.entries(this.DIMENSION_INCI_MAP)) {
      const score = scores[dim as keyof SkinScoreBreakdown];
      if (typeof score === 'number' && score >= 40 && list.length > 0) {
        recs[dim] = list.slice(0, 3).map((name) => ({
          ingredient: null,
          display_name: name,
          products: [],
        }));
      }
    }
    return recs;
  }

  /**
   * Day 8: REVELA `ingredients` tablosundan INCI metadata + her INCI için top 3 ürün.
   *
   * Performance:
   * - Tüm sorunlu boyutların INCI'leri tek query'de fuzzy match'lenir (similarity OR ILIKE)
   * - Top 3 ürün PARTITION BY ile tek query — Render free tier'da ~150ms toplam
   * - Sonuç process-local cache'lenir (1 saat) çünkü DIMENSION_INCI_MAP statik
   *
   * Skor <40 olan boyutlar için öneri çıkarılmaz (zaten temiz, INCI gerekmez).
   */
  private async buildEnrichedRecommendations(
    scores: SkinScoreBreakdown,
  ): Promise<Record<string, IngredientRecommendation[]>> {
    // Hangi boyutlar problemli ve hangi INCI isimleri lazım, çıkar
    const dimToNames = new Map<string, string[]>();
    const allNames = new Set<string>();
    for (const [dim, list] of Object.entries(this.DIMENSION_INCI_MAP)) {
      const score = scores[dim as keyof SkinScoreBreakdown];
      if (typeof score === 'number' && score >= 40 && list.length > 0) {
        const top = list.slice(0, 3);
        dimToNames.set(dim, top);
        top.forEach((n) => allNames.add(n));
      }
    }
    if (dimToNames.size === 0) return {};

    // Cache hit?
    if (
      this.recommendationsCache.value &&
      Date.now() - this.recommendationsCache.ts < this.REC_CACHE_TTL
    ) {
      // Cache global — sadece bu çağrıya konu olan boyutları filtrele
      const filtered: Record<string, IngredientRecommendation[]> = {};
      for (const dim of dimToNames.keys()) {
        if (this.recommendationsCache.value[dim]) filtered[dim] = this.recommendationsCache.value[dim];
      }
      if (Object.keys(filtered).length === dimToNames.size) return filtered;
    }

    // 1) INCI ismi → ingredient metadata lookup (paranthesis temizle, common_name + inci_name fuzzy)
    const normalizedNames = Array.from(allNames).map((n) =>
      n.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase(),
    );
    const ingredientRows: Array<{
      ingredient_id: number;
      inci_name: string;
      common_name: string | null;
      ingredient_slug: string;
      evidence_grade: string | null;
      function_summary: string | null;
      allergen_flag: boolean;
      fragrance_flag: boolean;
      query_name: string;
    }> = await this.dataSource.query(
      `
      SELECT DISTINCT ON (q.query_name)
        i.ingredient_id, i.inci_name, i.common_name, i.ingredient_slug,
        i.evidence_grade, i.function_summary, i.allergen_flag, i.fragrance_flag,
        q.query_name
      FROM unnest($1::text[]) AS q(query_name)
      LEFT JOIN LATERAL (
        SELECT *
        FROM ingredients ing
        WHERE LOWER(ing.inci_name) = q.query_name
           OR LOWER(COALESCE(ing.common_name, '')) = q.query_name
           OR LOWER(ing.inci_name) LIKE q.query_name || '%'
        ORDER BY
          CASE WHEN LOWER(ing.inci_name) = q.query_name THEN 0 ELSE 1 END,
          length(ing.inci_name) ASC
        LIMIT 1
      ) i ON true
      WHERE i.ingredient_id IS NOT NULL
      `,
      [normalizedNames],
    );

    // query_name → ingredient map (statik INCI ismini bu lookup'a bağla)
    const nameToIngredient = new Map<string, typeof ingredientRows[number]>();
    for (const row of ingredientRows) {
      nameToIngredient.set(row.query_name, row);
    }

    // 2) Top 3 ürün her ingredient için — tek query (PARTITION BY) ile
    const ingredientIds = ingredientRows.map((r) => r.ingredient_id);
    const productRows: Array<{
      ingredient_id: number;
      product_id: number;
      product_slug: string;
      product_name: string;
      brand_name: string;
      image_url: string | null;
      price: number | null;
    }> = ingredientIds.length === 0 ? [] : await this.dataSource.query(
      `
      SELECT ingredient_id, product_id, product_slug, product_name, brand_name, image_url, price
      FROM (
        SELECT
          pi.ingredient_id,
          p.product_id, p.product_slug, p.product_name,
          b.brand_name,
          (SELECT image_url FROM product_images img WHERE img.product_id = p.product_id ORDER BY img.sort_order ASC LIMIT 1) AS image_url,
          (SELECT MIN(al.price_snapshot)::float FROM affiliate_links al WHERE al.product_id = p.product_id AND al.verification_status NOT IN ('needs_review', 'dead')) AS price,
          ROW_NUMBER() OVER (
            PARTITION BY pi.ingredient_id
            ORDER BY pi.inci_order_rank ASC NULLS LAST, COALESCE(p.review_count, 0) DESC
          ) AS rn
        FROM product_ingredients pi
        JOIN products p ON p.product_id = pi.product_id
        JOIN brands b ON b.brand_id = p.brand_id
        WHERE pi.ingredient_id = ANY($1::int[])
          AND p.status = 'published'
          AND pi.inci_order_rank <= 10
          AND pi.match_status != 'pending_review'
      ) ranked
      WHERE rn <= 3
      ORDER BY ingredient_id, rn
      `,
      [ingredientIds],
    );

    // ingredient_id → products map
    const idToProducts = new Map<number, IngredientRecommendation['products']>();
    for (const p of productRows) {
      if (!idToProducts.has(p.ingredient_id)) idToProducts.set(p.ingredient_id, []);
      idToProducts.get(p.ingredient_id)!.push({
        product_id: p.product_id,
        product_slug: p.product_slug,
        product_name: p.product_name,
        brand_name: p.brand_name,
        image_url: p.image_url,
        price: p.price != null ? Number(p.price) : null,
      });
    }

    // 3) Sonucu boyut bazlı yapıya çevir
    const result: Record<string, IngredientRecommendation[]> = {};
    for (const [dim, names] of dimToNames.entries()) {
      result[dim] = names.map((name) => {
        const norm = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        const ing = nameToIngredient.get(norm);
        return {
          ingredient: ing
            ? {
                ingredient_id: ing.ingredient_id,
                inci_name: ing.inci_name,
                common_name: ing.common_name,
                ingredient_slug: ing.ingredient_slug,
                evidence_grade: (ing.evidence_grade as 'A' | 'B' | 'C' | 'D' | 'F' | null) ?? null,
                function_summary: ing.function_summary,
                allergen_flag: !!ing.allergen_flag,
                fragrance_flag: !!ing.fragrance_flag,
              }
            : null,
          display_name: ing?.common_name || ing?.inci_name || name,
          products: ing ? idToProducts.get(ing.ingredient_id) ?? [] : [],
        };
      });
    }

    // Cache global sonucu (tüm DIMENSION_INCI_MAP girdileri için, sonraki çağrıda
    // farklı skor profili gelse bile cache hit alır)
    this.recommendationsCache = { value: { ...this.recommendationsCache.value, ...result }, ts: Date.now() };

    return result;
  }

  /**
   * DB JSON column'una kaydederken full product listesi şişme yapmasın diye
   * sadece display_name + ingredient_id kaydederiz; gösterimde live çekilir.
   */
  private compactRecommendationsForStorage(
    enriched: Record<string, IngredientRecommendation[]>,
  ): Record<string, Array<{ display_name: string; ingredient_id: number | null }>> {
    const out: Record<string, Array<{ display_name: string; ingredient_id: number | null }>> = {};
    for (const [dim, items] of Object.entries(enriched)) {
      out[dim] = items.map((it) => ({
        display_name: it.display_name,
        ingredient_id: it.ingredient?.ingredient_id ?? null,
      }));
    }
    return out;
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

  /**
   * Anonim history — reminder email token'iyle auth'suz tüm geçmiş.
   * Faz 2 #2 trend history chart için. Aynı email_hash'in tüm analizleri döner.
   */
  async getHistoryByToken(token: string, limit = 20): Promise<Array<{
    analysis_id: number;
    created_at: string;
    scores: SkinScoreBreakdown;
    overall_score: number;
  }>> {
    if (!token || token.length !== 64) {
      throw new BadRequestException('Geçersiz token');
    }
    const anchor = await this.results.findOne({ where: { unsubscribe_token: token } });
    if (!anchor || anchor.unsubscribed_at) {
      throw new NotFoundException('Token bulunamadı veya iptal edilmiş');
    }
    const emailHash = anchor.anonymous_email;
    if (!emailHash) {
      throw new NotFoundException('Token bulundu ama email_hash kayıtsız');
    }
    const rows = await this.results.find({
      where: { anonymous_email: emailHash },
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 50),
    });
    return rows.map((r) => ({
      analysis_id: Number(r.analysis_id),
      created_at: r.created_at.toISOString(),
      scores: r.scores,
      overall_score: r.overall_score,
    }));
  }

  /**
   * Anonim compare — reminder email'deki unsubscribe_token ile auth'suz karşılaştırma.
   *
   * Akış:
   *  1. Token ile "from" analizini bul (email-bağlı, ownership token üzerinden)
   *  2. Aynı email_hash'e ait yeni bir analiz "to" varsa karşılaştır
   *     (to opsiyonel; verilmezse from'dan sonraki en yakın aynı email'li analiz)
   *  3. Token süresiz (unsubscribe edilene kadar) — opt-out olunca token NULL'lanır
   *     ve link otomatik geçersizleşir
   *
   * Güvenlik:
   *  - 64-hex token enumeration zor (256-bit entropy)
   *  - Sadece aynı email_hash'in analizleri döner (cross-user data leak yok)
   *  - Token bulunamadıysa NotFoundException (info leak yok, no email exposure)
   */
  async compareByToken(
    token: string,
    to?: number,
  ): Promise<ReturnType<typeof SkinAnalysisService.prototype.compareForUser>> {
    if (!token || token.length !== 64) {
      throw new BadRequestException('Geçersiz token');
    }
    const fromAnalysis = await this.results.findOne({ where: { unsubscribe_token: token } });
    if (!fromAnalysis || fromAnalysis.unsubscribed_at) {
      throw new NotFoundException('Token bulunamadı veya iptal edilmiş');
    }
    // anonymous_email hash zorunlu — token oluştuğunda yazılmış olmalı
    const emailHash = fromAnalysis.anonymous_email;
    if (!emailHash) {
      throw new NotFoundException('Token bulundu ama email_hash kayıtsız (legacy kayıt)');
    }
    // Aynı email_hash'in analizlerini topla — from + to (varsa parametre, yoksa otomatik)
    let toAnalysis: SkinAnalysisResult | null = null;
    if (to) {
      toAnalysis = await this.results.findOne({
        where: { analysis_id: String(to) as any, anonymous_email: emailHash },
      });
      if (!toAnalysis) {
        throw new NotFoundException('Karşılaştırılacak yeni analiz bulunamadı (aynı email ile bağlı olmalı)');
      }
    } else {
      // from'dan sonraki en yakın analiz
      const rows = await this.results.find({
        where: { anonymous_email: emailHash },
        order: { created_at: 'DESC' },
        take: 10,
      });
      toAnalysis = rows.find((r) => Number(r.analysis_id) > Number(fromAnalysis.analysis_id)) ?? null;
    }

    return this.shapeCompareResult(fromAnalysis, toAnalysis);
  }

  /**
   * Faz 2 başlangıcı (Gün 11 sonrası): iki analizi karşılaştır — trend grafiği için.
   *
   * Akış:
   *  - `to` (yeni) zorunlu, kullanıcının analizi olmalı
   *  - `from` (eski) opsiyonel — verilmezse otomatik bir önceki analizi seçer
   *  - 6 boyutta delta + overall delta + reminder email "yeni analiz çek" CTA destinasyonu
   *
   * Skor "yüksek = daha kötü" olduğu için delta < 0 = iyileşme (✅ trend up).
   */
  async compareForUser(
    userId: number,
    to: number,
    from?: number,
  ) {
    const toAnalysis = await this.results.findOne({
      where: { analysis_id: String(to) as any, user_id: userId },
    });
    if (!toAnalysis) {
      throw new NotFoundException('Karşılaştırılacak yeni analiz bulunamadı (sana ait olmayabilir)');
    }
    let fromAnalysis: SkinAnalysisResult | null = null;
    if (from) {
      fromAnalysis = await this.results.findOne({
        where: { analysis_id: String(from) as any, user_id: userId },
      });
    } else {
      const rows = await this.results.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
        take: 10,
      });
      fromAnalysis = rows.find((r) => Number(r.analysis_id) < to) ?? null;
    }
    return this.shapeCompareResult(fromAnalysis, toAnalysis);
  }

  /**
   * compareForUser + compareByToken ortak shape logic'i — Day 12 öncesi refactor.
   * Skor "yüksek = daha kötü" → delta < 0 = iyileşme.
   */
  private shapeCompareResult(
    fromAnalysis: SkinAnalysisResult | null,
    toAnalysis: SkinAnalysisResult | null,
  ) {
    if (!toAnalysis) {
      throw new NotFoundException('Karşılaştırılacak yeni analiz yok');
    }
    const toShape = {
      analysis_id: Number(toAnalysis.analysis_id),
      created_at: toAnalysis.created_at.toISOString(),
      scores: toAnalysis.scores,
      overall_score: toAnalysis.overall_score,
    };
    if (!fromAnalysis) {
      return { from: null, to: toShape, delta: null, days_between: null };
    }
    const fromShape = {
      analysis_id: Number(fromAnalysis.analysis_id),
      created_at: fromAnalysis.created_at.toISOString(),
      scores: fromAnalysis.scores,
      overall_score: fromAnalysis.overall_score,
    };
    const dimKeys: (keyof SkinScoreBreakdown)[] = [
      't_zone_oil', 'pore_visibility', 'wrinkles', 'pigmentation',
      'redness', 'under_eye_darkness', 'acne_count', 'fitzpatrick_type',
    ];
    const byDim = {} as Record<keyof SkinScoreBreakdown, number>;
    for (const k of dimKeys) {
      const fv = fromAnalysis.scores[k];
      const tv = toAnalysis.scores[k];
      if (typeof fv === 'number' && typeof tv === 'number') {
        byDim[k] = tv - fv;
      }
    }
    const daysBetween = Math.round(
      (toAnalysis.created_at.getTime() - fromAnalysis.created_at.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      from: fromShape,
      to: toShape,
      delta: {
        overall: toAnalysis.overall_score - fromAnalysis.overall_score,
        by_dimension: byDim,
      },
      days_between: daysBetween,
    };
  }

  // ============================================================
  // KVKK Madde 11 — Veri Hakları (Faz 1 Gün 10)
  // ============================================================

  /**
   * KVKK Madde 11 (e+f) — kullanıcının kişisel verilerinin silinmesini isteme hakkı.
   * Tüm skin_analysis_results kayıtlarını siler (foto blob + skor + email).
   * Audit log ACCOUNT_DELETE scope=skin_analysis ile yazılır.
   */
  async deleteAllForUser(
    userId: number,
    context: { ip?: string; user_agent?: string } = {},
  ): Promise<{ deleted: number }> {
    const result = await this.results.delete({ user_id: userId });
    const deleted = result.affected ?? 0;
    void this.audit('ACCOUNT_DELETE', {
      user_id: userId,
      ip: context.ip,
      user_agent: context.user_agent,
      details: { scope: 'skin_analysis', deleted_count: deleted },
    });
    return { deleted };
  }

  /**
   * KVKK Madde 11 (d) — veri taşınabilirlik hakkı.
   * Kullanıcının tüm analizlerini structured JSON formatında export eder.
   * Audit log DATA_EXPORT scope=skin_analysis ile yazılır.
   */
  async exportForUser(
    userId: number,
    context: { ip?: string; user_agent?: string } = {},
  ): Promise<{
    user_id: number;
    exported_at: string;
    analyses: Array<{
      analysis_id: number;
      created_at: string;
      scores: SkinScoreBreakdown;
      overall_score: number;
      guard_score: number | null;
      model_version: string;
      recommendations: SkinAnalysisResult['recommendations'];
    }>;
  }> {
    const rows = await this.results.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    void this.audit('DATA_EXPORT', {
      user_id: userId,
      ip: context.ip,
      user_agent: context.user_agent,
      details: { scope: 'skin_analysis', exported_count: rows.length },
    });
    return {
      user_id: userId,
      exported_at: new Date().toISOString(),
      analyses: rows.map((r) => ({
        analysis_id: Number(r.analysis_id),
        created_at: r.created_at.toISOString(),
        scores: r.scores,
        overall_score: r.overall_score,
        guard_score: r.guard_score,
        model_version: r.model_version,
        recommendations: r.recommendations,
      })),
    };
  }

  // ============================================================
  // Email funnel (Faz 1 Gün 9): opt-in welcome + 28-gün reminder
  // ============================================================

  /** Site URL (welcome/unsubscribe link'leri için). */
  private get siteUrl(): string {
    return this.config
      .get<string>('SITE_URL', 'https://kozmetik-platform.vercel.app')
      .trim()
      .replace(/\/+$/, '');
  }

  /**
   * Kullanıcı analiz sonucunda email opt-in yaparsa: subscription_email + hash
   * + unsubscribe_token kaydet, welcome email yolla. Opportunistic: aynı analiz_id
   * tekrar opt-in olursa noop (idempotent).
   */
  async subscribeToEmail(
    analysisId: number,
    email: string,
  ): Promise<{ subscribed: boolean; reason?: string }> {
    const normalized = email.trim().toLowerCase();
    // Basit email format guard — RFC 5322 değil ama abuse'i durdurur
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
      throw new BadRequestException('Geçersiz email formatı');
    }
    const analysis = await this.results.findOne({ where: { analysis_id: String(analysisId) as any } });
    if (!analysis) throw new NotFoundException('Analiz bulunamadı');

    // Idempotent — zaten subscribed ise welcome email tekrar yollama
    if (analysis.subscription_email === normalized && analysis.welcome_email_sent_at) {
      return { subscribed: true, reason: 'already_subscribed' };
    }

    const token = randomBytes(32).toString('hex');
    const emailHash = createHash('sha256').update(normalized).digest('hex');

    await this.results.update(
      { analysis_id: String(analysisId) as any },
      {
        subscription_email: normalized,
        anonymous_email: emailHash, // hash da yenile (eski boş olabilir)
        unsubscribe_token: token,
        unsubscribed_at: null, // re-subscribe ise resetle
      },
    );

    // Welcome email (fire-and-forget, fail kullanıcıyı bloke etmesin)
    void this.sendWelcomeEmail(analysisId, normalized, token, analysis.overall_score).then((sent) => {
      if (sent) {
        void this.results.update(
          { analysis_id: String(analysisId) as any },
          { welcome_email_sent_at: new Date() },
        );
      }
    });

    return { subscribed: true };
  }

  /** Tek tıkla opt-out (email içindeki link). subscription_email NULL'lar; hash sürer. */
  async unsubscribeByToken(token: string): Promise<{ success: boolean }> {
    if (!token || token.length !== 64) {
      throw new BadRequestException('Geçersiz token');
    }
    const result = await this.results.update(
      { unsubscribe_token: token },
      {
        subscription_email: null,
        unsubscribed_at: new Date(),
        unsubscribe_token: null,
      },
    );
    if (!result.affected) {
      // Token bulunamadı / zaten kullanılmış — kullanıcıya yine de "başarılı" göster
      // (token enumeration'a karşı no info leak)
      this.logger.warn(`Unsubscribe token not found: ${token.slice(0, 8)}…`);
    }
    return { success: true };
  }

  /**
   * Daily cron entry point. 28+ gün önce yapılmış, opt-in yapılmış,
   * reminder yollanmamış analizleri bulup hatırlatma yolla.
   *
   * @returns gönderilen email sayısı (log için)
   */
  async sendDueReminders(): Promise<{ sent: number; failed: number }> {
    const cutoff = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const candidates = await this.results.find({
      where: {
        subscription_email: Not(IsNull()),
        reminder_email_sent_at: IsNull(),
        unsubscribed_at: IsNull(),
        created_at: LessThan(cutoff),
      },
      take: 100, // güvenlik: tek seferde 100'den fazla yollama (Resend rate)
      order: { created_at: 'ASC' },
    });

    let sent = 0;
    let failed = 0;
    for (const a of candidates) {
      if (!a.subscription_email || !a.unsubscribe_token) {
        failed++;
        continue;
      }
      const ok = await this.sendReminderEmail(
        Number(a.analysis_id),
        a.subscription_email,
        a.unsubscribe_token,
        a.overall_score,
        a.created_at,
      );
      if (ok) {
        await this.results.update(
          { analysis_id: a.analysis_id },
          { reminder_email_sent_at: new Date() },
        );
        sent++;
      } else {
        failed++;
      }
    }
    if (candidates.length > 0) {
      this.logger.log(`Reminder cron: ${sent} sent, ${failed} failed (${candidates.length} candidates)`);
    }
    return { sent, failed };
  }

  // ---- Email template'leri (inline HTML, user-auth Resend pattern'i ile uyumlu) ----

  private async sendWelcomeEmail(
    analysisId: number,
    email: string,
    unsubToken: string,
    score: number,
  ): Promise<boolean> {
    const resultUrl = `${this.siteUrl}/cilt-analizi/foto-test?ref=email&analysis=${analysisId}`;
    const unsubUrl = `${this.siteUrl}/cilt-analizi/abonelik-iptal?token=${unsubToken}`;
    return this.mail.send({
      to: email,
      subject: 'REVELA cilt analizin kaydedildi 🌿',
      html: this.welcomeTemplate(score, resultUrl, unsubUrl),
    });
  }

  private async sendReminderEmail(
    analysisId: number,
    email: string,
    unsubToken: string,
    previousScore: number,
    previousDate: Date,
  ): Promise<boolean> {
    // Reminder akışı: kullanıcı foto-test sayfasında yeni analiz çeker, query'deki
    // token + prev parametrelerini taşır → result CTA "Karşılaştır" /karsilastir?token=&from=&to=
    // /karsilastir sayfası `compare-by-token` endpoint'ini auth'suz çağırır.
    const testUrl = `${this.siteUrl}/cilt-analizi/foto-test?ref=reminder&prev=${analysisId}&token=${unsubToken}`;
    const unsubUrl = `${this.siteUrl}/cilt-analizi/abonelik-iptal?token=${unsubToken}`;
    const dateStr = previousDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    return this.mail.send({
      to: email,
      subject: '28 gün geçti — cildin nasıl değişti? 📸',
      html: this.reminderTemplate(previousScore, dateStr, testUrl, unsubUrl),
    });
  }

  private welcomeTemplate(score: number, resultUrl: string, unsubUrl: string): string {
    return `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
        <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.02em;margin:0 0 8px">REVELA</h1>
        <p style="color:#6b6b6b;font-size:14px;margin:0 0 24px">Cilt Analizi · 6-Boyut Skoru</p>
        <h2 style="font-size:18px;margin:0 0 12px">Analizin kaydedildi 🌿</h2>
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 16px">
          Genel cilt skorun: <strong style="color:#1a1a1a;font-size:18px">${score}/100</strong>
          <span style="color:#9a9a9a;font-size:12px"> (yüksek = daha şiddetli)</span>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
          28 gün sonra tekrar fotoğraf çekersen seninle iletişime geçeriz — INCI önerilerinin etkisini görmek için.
        </p>
        <a href="${resultUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Sonucu Tekrar Aç</a>
        <p style="font-size:12px;color:#9a9a9a;margin:32px 0 0">
          Bu hatırlatmayı istemiyorsan <a href="${unsubUrl}" style="color:#9a9a9a">tek tıkla iptal et</a>.
        </p>
      </div>
    `;
  }

  private reminderTemplate(prevScore: number, prevDate: string, testUrl: string, unsubUrl: string): string {
    return `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
        <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.02em;margin:0 0 8px">REVELA</h1>
        <p style="color:#6b6b6b;font-size:14px;margin:0 0 24px">28-Gün Karşılaştırma</p>
        <h2 style="font-size:18px;margin:0 0 12px">Cildin nasıl değişti? 📸</h2>
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 16px">
          <strong>${prevDate}</strong> tarihindeki analizinde genel skorun <strong>${prevScore}/100</strong>'dü.
          INCI önerilerini takip ettiysen şimdi farkı görme zamanı.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
          Yeni bir fotoğraf çek — REVELA aynı 6 boyutta yeni skorunu çıkarsın, trend grafiğini görelim.
        </p>
        <a href="${testUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Yeni Analiz Çek</a>
        <p style="font-size:12px;color:#9a9a9a;margin:32px 0 0">
          Hatırlatma istemiyorsan <a href="${unsubUrl}" style="color:#9a9a9a">tek tıkla iptal et</a>.
        </p>
      </div>
    `;
  }
}
