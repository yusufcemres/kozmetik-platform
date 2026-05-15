import { IsBase64, IsIn, IsOptional, IsString, MaxLength, Matches, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

/**
 * Skin-Analysis foto analiz request body validation.
 *
 * Smart-Scan'dan farkı: bu uygulama **kullanıcı yüzü** analiz eder (cilt sağlığı için)
 * — smart-scan ürün etiketi/barkod analiz ederdi. Aynı MIME whitelist + 5MB sınırı.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 1 ile eklendi.
 */
export class SkinAnalysisRequestDto {
  @ApiProperty({ description: 'Yüz fotoğrafı base64 (max ~6.7MB, data URI prefix opsiyonel)' })
  @IsString()
  @MaxLength(7_000_000, { message: 'image_base64 5MB binary sınırını aşıyor' })
  @Matches(/^(data:image\/(jpeg|jpg|png|webp);base64,)?[A-Za-z0-9+/]+={0,2}$/, {
    message: 'image_base64 geçerli base64 (jpeg/png/webp) olmalı',
  })
  image_base64: string;

  @ApiProperty({ example: 'image/jpeg', enum: ['image/jpeg', 'image/png', 'image/webp'] })
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'image_mime sadece image/jpeg, image/png veya image/webp olabilir',
  })
  image_mime: string;

  /** Opsiyonel: kullanıcı opt-in olursa foto S3'te şifreli saklanır (default sil). */
  @ApiPropertyOptional({ description: "Foto'yu sunucuda sakla (opt-in, premium)" })
  @IsOptional()
  store_photo?: boolean;

  /** Tarayıcı çekim guard skoru (kalite skoru, 0-100). MediaPipe FaceLandmarker'dan geliyor. */
  @ApiPropertyOptional({ description: 'Çekim guard kalite skoru (0-100, MediaPipe)' })
  @IsOptional()
  guard_score?: number;
}

/**
 * 6-boyutlu cilt skor breakdown'u (her boyut 0-100, yüksek = daha kötü/daha şiddetli).
 * Gemini Vision JSON çıktısı bu shape'i karşılamalı.
 */
export interface SkinScoreBreakdown {
  /** T-bölgesi parlama / yağlanma */
  t_zone_oil: number;
  /** Gözenek görünürlüğü */
  pore_visibility: number;
  /** Kırışıklık (alın + göz çevresi) */
  wrinkles: number;
  /** Leke / hiperpigmentasyon */
  pigmentation: number;
  /** Kızarıklık / inflamasyon */
  redness: number;
  /** Gözaltı moru / koyuluk */
  under_eye_darkness: number;
  /** Bonus: aktif akne sayım (sayı, 0-50+) */
  acne_count?: number;
  /** Bonus: Fitzpatrick cilt tonu I-VI */
  fitzpatrick_type?: number;
}

export interface SkinAnalysisResponse {
  /** Skor JSON (6-boyut) */
  scores: SkinScoreBreakdown;
  /** Genel skor (ağırlıklı ortalama, 0-100) */
  overall_score: number;
  /** Her boyut için INCI öneri (boyut → top INCI'ler) */
  recommendations: Record<keyof SkinScoreBreakdown, string[]>;
  /** Hangi model versiyonu kullanıldı (deterministiklik garantisi) */
  model_version: string;
  /** Analiz timestamp + analiz_id (DB primary key) */
  analysis_id: number;
  created_at: string;
}
