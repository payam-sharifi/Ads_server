import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

/**
 * AdminPermission entity - Join table for Admin users and their permissions
 * 
 * This allows Admins to have specific permissions assigned to them.
 * Super Admins have all permissions by default (checked in guards).
 */
@Entity('admin_permissions')
export class AdminPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  adminId: string;

  @Column({ type: 'uuid', name: 'permission_id' })
  permissionId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.adminPermissions)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @ManyToOne(() => Permission, (permission) => permission.adminPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}

