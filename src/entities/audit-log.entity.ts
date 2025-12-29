import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * AuditLog entity for tracking admin actions
 * 
 * Actions tracked:
 * - User management (create, update, block, suspend)
 * - Ad management (approve, reject, edit, delete)
 * - Permission assignments
 * - Admin creation
 */
export enum AuditAction {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_BLOCKED = 'user.blocked',
  USER_UNBLOCKED = 'user.unblocked',
  USER_SUSPENDED = 'user.suspended',
  AD_APPROVED = 'ad.approved',
  AD_REJECTED = 'ad.rejected',
  AD_EDITED = 'ad.edited',
  AD_DELETED = 'ad.deleted',
  PERMISSION_ASSIGNED = 'permission.assigned',
  PERMISSION_REVOKED = 'permission.revoked',
  ADMIN_CREATED = 'admin.created',
  ADMIN_UPDATED = 'admin.updated',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action: AuditAction;

  @Column({ type: 'uuid', name: 'admin_id' })
  @Index()
  adminId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string; // 'user', 'ad', 'permission', etc.

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}

