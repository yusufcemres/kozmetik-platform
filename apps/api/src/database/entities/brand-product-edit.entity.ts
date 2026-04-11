import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('brand_product_edits')
export class BrandProductEdit {
  @PrimaryGeneratedColumn()
  edit_id: number;

  @Column({ type: 'int' })
  brand_account_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'varchar', length: 100 })
  field_name: string; // inci_verified | concentration_data | usage_instructions | ph_value | etc.

  @Column({ type: 'text', nullable: true })
  old_value: string;

  @Column({ type: 'text', nullable: true })
  new_value: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending | approved | rejected

  @Column({ type: 'int', nullable: true })
  reviewed_by: number; // admin_user_id

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
