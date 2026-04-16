import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_scores')
export class ProductScore {
  @PrimaryGeneratedColumn()
  score_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 20 })
  algorithm_version: string;

  @Column({ type: 'smallint' })
  overall_score: number;

  @Column({ type: 'varchar', length: 1 })
  grade: string;

  @Column({ type: 'jsonb' })
  breakdown: Record<string, number>;

  @Column({ type: 'jsonb' })
  explanation: {
    component: string;
    value: number;
    delta: number;
    reason: string;
    citation?: {
      source: string;
      url?: string;
      pmid?: string;
      doi?: string;
      opinion_ref?: string;
      year?: number;
    };
  }[];

  @Column({ type: 'jsonb', nullable: true })
  flags: Record<string, string[]> | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  floor_cap_applied: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  computed_at: Date;
}
