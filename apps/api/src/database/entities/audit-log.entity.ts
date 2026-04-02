import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string; // 'product', 'ingredient', 'need', etc.

  @Column({ type: 'int' })
  entity_id: number;

  @Column({ type: 'varchar', length: 50 })
  action: string; // 'create', 'update', 'delete', 'publish', 'archive'

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, unknown>;

  @Column({ type: 'int', nullable: true })
  admin_user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  admin_email: string;

  @CreateDateColumn()
  created_at: Date;
}
