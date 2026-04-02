import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  image_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 500 })
  image_url: string;

  @Column({ type: 'varchar', length: 50, default: 'product' })
  image_type: string; // 'product', 'label', 'texture', 'before_after'

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alt_text: string;

  @CreateDateColumn()
  created_at: Date;
}
