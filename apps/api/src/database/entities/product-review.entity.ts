import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { AppUser } from './app-user.entity';

@Entity('product_reviews')
@Unique('uq_product_reviews_user_product', ['user_id', 'product_id'])
export class ProductReview {
  @PrimaryGeneratedColumn()
  review_id: number;

  @Index()
  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Index()
  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => AppUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: AppUser;

  // 1-5 inclusive (CHECK constraint)
  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  // 'visible' | 'hidden' | 'pending' — MVP inserts 'visible'
  @Column({ type: 'varchar', length: 20, default: 'visible' })
  status: string;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ type: 'boolean', default: false })
  verified_purchase: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
