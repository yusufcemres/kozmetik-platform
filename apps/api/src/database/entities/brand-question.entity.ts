import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('brand_questions')
export class BrandQuestion {
  @PrimaryGeneratedColumn()
  question_id: number;

  @Column({ type: 'int' })
  brand_id: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'int', nullable: true })
  product_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  anonymous_id: string;

  @Column({ type: 'varchar', length: 30, default: 'general' })
  category: string; // ingredient | usage | side_effect | price | production | vegan | general

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'int', nullable: true })
  answered_by: number; // brand_account_id

  @Column({ type: 'timestamp', nullable: true })
  answered_at: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending | answered | rejected | flagged

  @Column({ type: 'varchar', length: 200, nullable: true })
  flagged_reason: string;

  @Column({ type: 'int', nullable: true })
  moderated_by: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @CreateDateColumn()
  created_at: Date;
}
