import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('price_alerts')
export class PriceAlert {
  @PrimaryGeneratedColumn()
  alert_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'jsonb' })
  push_subscription: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  target_price: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
