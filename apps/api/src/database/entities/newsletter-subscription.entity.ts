import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Newsletter abonelik kaydı (Migration 036, Faz P 2026-05-19).
 *
 * KVKK: email plaintext saklanır + hash de tutulur (lookup için).
 * unsubscribe sonrası email NULL'a çekilir, hash + tomb stone tarih kalır
 * (re-subscribe için ve aynı email tekrar abone olsa send_count carry).
 */
@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  subscription_id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  email_hash: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  unsubscribe_token: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  subscribed_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unsubscribed_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_page: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_sent_at: Date | null;

  @Column({ type: 'int', default: 0 })
  send_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
