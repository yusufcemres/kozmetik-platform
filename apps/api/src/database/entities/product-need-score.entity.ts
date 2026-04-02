import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Need } from './need.entity';

@Entity('product_need_scores')
export class ProductNeedScore {
  @PrimaryGeneratedColumn()
  product_need_score_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (p) => p.need_scores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  need_id: number;

  @ManyToOne(() => Need, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'need_id' })
  need: Need;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  compatibility_score: number; // 0-100

  @Column({ type: 'text', nullable: true })
  score_reason_summary: string;

  @Column({ type: 'jsonb', nullable: true })
  explanation_logic: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  confidence_level: string; // high, medium, low

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  calculated_at: Date;
}
