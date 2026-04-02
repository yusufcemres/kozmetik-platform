import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('batch_imports')
export class BatchImport {
  @PrimaryGeneratedColumn()
  import_id: number;

  @Column({ type: 'varchar', length: 100 })
  import_type: string; // 'products_csv', 'ingredients_csv', 'mappings_csv'

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_name: string;

  @Column({ type: 'int', default: 0 })
  total_rows: number;

  @Column({ type: 'int', default: 0 })
  success_count: number;

  @Column({ type: 'int', default: 0 })
  error_count: number;

  @Column({ type: 'jsonb', nullable: true })
  error_details: Record<string, unknown>[];

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, processing, completed, failed

  @Column({ type: 'int', nullable: true })
  admin_user_id: number;

  @CreateDateColumn()
  created_at: Date;
}
