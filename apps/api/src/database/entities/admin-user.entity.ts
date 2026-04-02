import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminRole } from './admin-role.entity';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  admin_user_id: number;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 250 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'int' })
  role_id: number;

  @ManyToOne(() => AdminRole)
  @JoinColumn({ name: 'role_id' })
  role: AdminRole;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
