import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppUser } from './app-user.entity';
import type { SkinScoreBreakdown } from '../../modules/skin-analysis/dto/skin-analysis.dto';

/**
 * Foto analiz sonucu — 6-boyut skor + öneri JSON.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 1 ile eklendi (Migration 031).
 * - user_id nullable: anonim analiz de mümkün (ücretsiz tier, email kayıt opsiyonel)
 * - photo_blob default null: opt-in olmadıkça foto saklanmaz (KVKK biyometrik veri)
 * - guard_score: tarayıcı çekim guard (MediaPipe) kalitesi
 * - model_version: Gemini/Claude versiyonu (deterministik karşılaştırma için)
 */
@Entity('skin_analysis_results')
@Index('idx_skin_analysis_user_created', ['user_id', 'created_at'])
@Index('idx_skin_analysis_email_created', ['anonymous_email', 'created_at'])
export class SkinAnalysisResult {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  analysis_id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @ManyToOne(() => AppUser, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: AppUser | null;

  /** Anonim analiz için email (opt-in 28-gün reminder akışı). KVKK: hash'le sakla. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  anonymous_email: string | null;

  /** 6-boyut skor breakdown (DTO interface ile uyumlu) */
  @Column({ type: 'jsonb' })
  scores: SkinScoreBreakdown;

  /** Genel ağırlıklı skor (0-100, daha yüksek = daha kötü cilt durumu) */
  @Column({ type: 'smallint' })
  overall_score: number;

  /**
   * Her boyut için INCI öneri (compact storage formatı).
   * Day 8 öncesi: `string[]` — Day 8 sonrası: `{display_name, ingredient_id}[]`
   * (tam product listesi storage'a yazılmaz, gösterimde live çekilir; jsonb runtime'da
   * format değişikliğini eski kayıtlarla geriye dönük tutar).
   */
  @Column({ type: 'jsonb', nullable: true })
  recommendations:
    | Record<string, string[]>
    | Record<string, Array<{ display_name: string; ingredient_id: number | null }>>
    | null;

  /** Çekim guard skoru (MediaPipe + parlaklık + bulanıklık, 0-100) */
  @Column({ type: 'smallint', nullable: true })
  guard_score: number | null;

  /** AI model versiyonu — "gemini-2.0-flash" veya "claude-sonnet-4-6" */
  @Column({ type: 'varchar', length: 50 })
  model_version: string;

  /** Opt-in foto saklama (default null, sadece kullanıcı izin verirse base64) */
  @Column({ type: 'text', nullable: true })
  photo_blob: string | null;

  /** IP + user-agent log (KVKK audit, rate limit) */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  created_at: Date;
}
