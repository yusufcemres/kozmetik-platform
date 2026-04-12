import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('unknown_scans')
export class UnknownScan {
  @PrimaryGeneratedColumn()
  scan_id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  detected_brand: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  detected_name: string | null;

  @Column({ type: 'text', nullable: true })
  ocr_text: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  image_hash: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
