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
import { ProductMaster } from './product-master.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  variant_id: number;

  @Column({ type: 'int' })
  master_id: number;

  @ManyToOne(() => ProductMaster, (m) => m.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'master_id' })
  master: ProductMaster;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string; // e.g. 'TR', 'EU', 'US'

  @Column({ type: 'varchar', length: 100, nullable: true })
  size_label: string; // e.g. '50ml', '100ml'

  @OneToMany(() => Product, (p) => p.variant)
  products: Product[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
