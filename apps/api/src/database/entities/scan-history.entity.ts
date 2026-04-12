import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('scan_history')
export class ScanHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Index()
  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int', nullable: true })
  product_id: number | null;

  @Column({ type: 'varchar', length: 20 })
  method: string; // 'barcode' | 'vision' | 'ocr'

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  confidence: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  raw_barcode: string | null;

  @Column({ type: 'text', nullable: true })
  raw_query: string | null;

  @CreateDateColumn()
  created_at: Date;
}
