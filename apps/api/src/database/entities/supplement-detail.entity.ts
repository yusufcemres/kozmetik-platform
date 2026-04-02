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

@Entity('supplement_details')
export class SupplementDetail {
  @PrimaryGeneratedColumn()
  supplement_detail_id: number;

  @Column({ type: 'int', unique: true })
  product_id: number;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 30 })
  form: string; // tablet, capsule, softgel, powder, liquid, gummy, spray, drop

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  serving_size: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  serving_unit: string; // mg, mcg, g, IU, ml, CFU

  @Column({ type: 'int', nullable: true })
  servings_per_container: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  recommended_use: string; // e.g. "Günde 1 tablet, yemekle birlikte"

  @Column({ type: 'text', nullable: true })
  warnings: string; // Uyarılar (hamilelik, ilaç etkileşimi vb.)

  @Column({ type: 'boolean', default: false })
  requires_prescription: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer_country: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  certification: string; // GMP, NSF, USP vb.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
