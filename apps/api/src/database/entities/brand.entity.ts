import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  brand_id: number;

  @Column({ type: 'varchar', length: 150 })
  brand_name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  brand_slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country_of_origin: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
