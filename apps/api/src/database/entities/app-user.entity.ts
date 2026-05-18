import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('app_users')
export class AppUser {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  display_name: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  /**
   * Premium üyelik bitiş tarihi (Faz 3, Migration 033).
   * NOW() > premium_until veya NULL → ücretsiz tier.
   * 29 TL one-time için lifetime (örn. 2099-12-31).
   * 49 TL/ay → +30 gün, 490 TL/yıl → +365 gün, IPN success'te güncellenir.
   */
  @Column({ type: 'timestamptz', nullable: true })
  premium_until: Date | null;

  /**
   * Premium bitiş hatırlatma maili gönderim zamanı (Migration 034).
   * NULL → henüz uyarılmadı, daha önce reminder gönderilmiş kullanıcılara
   * aynı period için 2. mail gönderilmez. premium_until uzatılınca NULL'a
   * çekilir → yeni period için tekrar uyarı.
   */
  @Column({ type: 'timestamptz', nullable: true })
  premium_reminder_sent_at: Date | null;

  /**
   * Auto-renew opt-in (Migration 035, 2026-05-19).
   * true → kullanıcı premium_until yaklaşırken "tek-tıkla yenile" maili alır
   *        (linki direkt /odeme?plan=last_plan_code).
   * Tam auto-charge PayTR Subscription API onayı geldiğinde aktive edilecek.
   */
  @Column({ type: 'boolean', default: false })
  auto_renew_enabled: boolean;

  /** Son satın alınan plan kodu (reminder mail'inde aynı plan önerilir). */
  @Column({ type: 'varchar', length: 30, nullable: true })
  last_plan_code: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
