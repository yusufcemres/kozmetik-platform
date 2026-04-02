import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('product_masters')
export class ProductMaster {
  @PrimaryGeneratedColumn()
  master_id: number;

  @Column({ type: 'int' })
  brand_id: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'int' })
  category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 250 })
  master_name: string;

  @Column({ type: 'varchar', length: 20, default: 'cosmetic' })
  domain_type: string;

  @OneToMany(() => ProductVariant, (v) => v.master)
  variants: ProductVariant[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
