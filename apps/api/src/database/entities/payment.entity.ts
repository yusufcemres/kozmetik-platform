import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppUser } from './app-user.entity';

/**
 * PayTR ödeme audit tablosu (Migration 033, Faz 3 başlangıcı).
 *
 * Her checkout + IPN için kalıcı kayıt. KVKK + muhasebe + chargeback denetim
 * + idempotent IPN için kritik (merchant_oid UNIQUE).
 */
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentPlanCode = '29_one_time' | '49_monthly' | '490_yearly';

@Entity('payments')
@Index('idx_payments_status_created_unique', ['status', 'created_at'])
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  payment_id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @ManyToOne(() => AppUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: AppUser | null;

  /** PayTR'a verilen unique sipariş ID — idempotent (UNIQUE constraint) */
  @Column({ type: 'varchar', length: 64, unique: true })
  merchant_oid: string;

  @Column({ type: 'varchar', length: 40 })
  plan_code: PaymentPlanCode;

  /** Tutar kuruş cinsinden (29 TL = 2900). PayTR API integer kuruş bekler. */
  @Column({ type: 'int' })
  amount_kurus: number;

  @Column({ type: 'varchar', length: 3, default: 'TL' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentStatus;

  /** IPN callback zamanı (null = henüz callback yok) */
  @Column({ type: 'timestamptz', nullable: true })
  ipn_received_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failure_reason: string | null;

  /** PayTR IPN body full — debug + denetim kanıtı */
  @Column({ type: 'jsonb', nullable: true })
  raw_payload: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
