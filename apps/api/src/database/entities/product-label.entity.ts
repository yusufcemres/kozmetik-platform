import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_labels')
export class ProductLabel {
  @PrimaryGeneratedColumn()
  product_label_id: number;

  @Column({ type: 'int', unique: true })
  product_id: number;

  @OneToOne(() => Product, (p) => p.label, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'text', nullable: true })
  inci_raw_text: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ingredient_header_text: string;

  @Column({ type: 'text', nullable: true })
  usage_instructions: string;

  @Column({ type: 'text', nullable: true })
  warning_text: string;

  @Column({ type: 'text', nullable: true })
  manufacturer_info: string;

  @Column({ type: 'text', nullable: true })
  distributor_info: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  origin_info: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batch_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  expiry_info: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pao_info: string; // Period After Opening, e.g. '12M'

  @Column({ type: 'varchar', length: 100, nullable: true })
  net_content_display: string;

  @Column({ type: 'jsonb', nullable: true })
  packaging_symbols_json: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  claim_texts_json: string[]; // ["anti-aging", "brightening"]

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
