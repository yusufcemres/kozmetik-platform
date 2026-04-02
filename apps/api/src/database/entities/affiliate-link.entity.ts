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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
