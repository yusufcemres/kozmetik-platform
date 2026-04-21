import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('affiliate_links')
@Unique(['product_id', 'platform'])
export class AffiliateLink {
  @PrimaryGeneratedColumn()
  affiliate_link_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (p) => p.affiliate_links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 50 })
  platform: string; // trendyol, hepsiburada, amazon_tr, dermoeczanem, gratis, other

  @Column({ type: 'varchar', length: 1000 })
  affiliate_url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_snapshot: number;

  @Column({ type: 'timestamp', nullable: true })
  price_updated_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_verified: Date;

  @Column({ type: 'varchar', length: 20, default: 'unverified' })
  verification_status: string; // unverified, valid, redirect, dead, search_only, needs_review

  @Column({ type: 'int', default: 0 })
  consecutive_failures: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  last_error_type: string | null;

  @Column({ type: 'text', nullable: true })
  last_error_message: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_attempted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
