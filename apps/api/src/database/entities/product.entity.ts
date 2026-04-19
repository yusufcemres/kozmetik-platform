import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductLabel } from './product-label.entity';
import { ProductImage } from './product-image.entity';
import { ProductIngredient } from './product-ingredient.entity';
import { ProductNeedScore } from './product-need-score.entity';
import { AffiliateLink } from './affiliate-link.entity';
import { ProductScore } from './product-score.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'int', nullable: true })
  variant_id: number;

  @ManyToOne(() => ProductVariant, (v) => v.products, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

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

  @Column({ type: 'varchar', length: 20, default: 'cosmetic' })
  domain_type: string;

  @Column({ type: 'varchar', length: 300 })
  product_name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  product_slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  product_type_label: string; // e.g. 'serum', 'moisturizer', 'cleanser'

  @Column({ type: 'text', nullable: true })
  short_description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  net_content_value: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  net_content_unit: string; // 'ml', 'g', 'oz'

  @Column({ type: 'varchar', length: 100, nullable: true })
  target_area: string; // 'face', 'body', 'hair', 'eye'

  @Column({ type: 'varchar', length: 50, nullable: true })
  usage_time_hint: string; // 'morning', 'evening', 'both'

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  target_gender: string; // null=unisex, 'female', 'male'

  @Column({ type: 'varchar', length: 30, default: 'adult' })
  target_audience: string; // adult|pregnant|breastfeeding|infant_0_12m|child_1_3y|child_4_12y

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // draft, in_review, published, archived

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  favorite_count: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  top_need_name: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  top_need_score: number;

  @OneToOne(() => ProductLabel, (label) => label.product)
  label: ProductLabel;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => ProductIngredient, (pi) => pi.product)
  ingredients: ProductIngredient[];

  @OneToMany(() => ProductNeedScore, (score) => score.product)
  need_scores: ProductNeedScore[];

  @OneToMany(() => AffiliateLink, (link) => link.product)
  affiliate_links: AffiliateLink[];

  @OneToMany(() => ProductScore, (ps) => ps.product)
  product_scores: ProductScore[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
