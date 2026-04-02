import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AffiliateLink } from './affiliate-link.entity';

@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn()
  price_history_id: number;

  @Column({ type: 'int' })
  affiliate_link_id: number;

  @ManyToOne(() => AffiliateLink, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_link_id' })
  affiliate_link: AffiliateLink;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  in_stock: boolean;

  @Column({ type: 'varchar', length: 10, default: 'TRY' })
  currency: string;

  @CreateDateColumn()
  recorded_at: Date;
}
