import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { AdminPermission } from './admin-permission.entity';

/**
 * Permission entity for PBAC
 * 
 * Permission format: resource.action
 * Examples:
 * - ads.approve
 * - ads.reject
 * - ads.edit
 * - ads.delete
 * - users.view
 * - users.block
 * - messages.view
 * - categories.manage
 * - admins.manage
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // e.g., 'ads.approve'

  @Column({ type: 'varchar', length: 100 })
  resource: string; // e.g., 'ads'

  @Column({ type: 'varchar', length: 100 })
  action: string; // e.g., 'approve'

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => AdminPermission, (adminPermission) => adminPermission.permission)
  adminPermissions: AdminPermission[];
}

