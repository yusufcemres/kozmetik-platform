import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppUser } from './app-user.entity';

/**
 * KVKK + denetim için kullanıcı aksiyon audit log.
 *
 * Migration 030 ile tanıtıldı (Madde 8). Kanonik aksiyon tipleri:
 *   LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_RATE_LIMITED,
 *   DATA_EXPORT, ACCOUNT_DELETE, CONSENT_UPDATE, PROFILE_UPDATE
 *
 * `user_id` nullable: anonim login_request / rate_limited durumda email_hash + ip ile takip.
 */
export type UserActionType =
  | 'LOGIN_REQUEST'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_RATE_LIMITED'
  | 'DATA_EXPORT'
  | 'ACCOUNT_DELETE'
  | 'CONSENT_UPDATE'
  | 'PROFILE_UPDATE';

@Entity('user_actions')
@Index('idx_user_actions_user_id', ['user_id'])
@Index('idx_user_actions_type_created', ['action_type', 'created_at'])
@Index('idx_user_actions_email_hash', ['email_hash'])
@Index('idx_user_actions_ip', ['ip'])
export class UserAction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  action_id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @ManyToOne(() => AppUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: AppUser | null;

  @Column({ type: 'varchar', length: 40 })
  action_type: UserActionType;

  /** SHA-256 hash of email (PII minimization for anonymous events). */
  @Column({ type: 'varchar', length: 64, nullable: true })
  email_hash: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at: Date;
}
