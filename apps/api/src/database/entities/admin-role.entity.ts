import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin_roles')
export class AdminRole {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  role_key: string; // super_admin, content_editor, taxonomy_editor, reviewer, methodology_reviewer

  @Column({ type: 'varchar', length: 100 })
  role_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[]; // ['products.write', 'articles.write', 'ingredients.read']

  @CreateDateColumn()
  created_at: Date;
}
