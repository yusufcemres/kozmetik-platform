import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('formula_revisions')
export class FormulaRevision {
  @PrimaryGeneratedColumn()
  revision_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'text' })
  previous_inci_text: string;

  @Column({ type: 'text' })
  new_inci_text: string;

  @Column({ type: 'text', nullable: true })
  change_summary: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  changed_by: string;

  @CreateDateColumn()
  created_at: Date;
}
