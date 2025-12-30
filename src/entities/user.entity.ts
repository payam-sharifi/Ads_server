import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ad } from './ad.entity';
import { Message } from './message.entity';
import { Role } from './role.entity';
import { AdminPermission } from './admin-permission.entity';
import { Report } from './report.entity';
import { AuditLog } from './audit-log.entity';
import { Bookmark } from './bookmark.entity';
import { Exclude } from 'class-transformer';

/**
 * User entity representing registered users in the system
 * 
 * Relationships:
 * - One user can have many ads
 * - One user can send/receive many messages
 * - One user has one role
 * - Admin users can have many permissions
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() // Exclude password from responses
  password: string;

  @Column({ type: 'uuid', name: 'role_id' })
  @Index()
  roleId: string;

  @Column({ type: 'boolean', default: false, name: 'is_blocked' })
  isBlocked: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_suspended' })
  isSuspended: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'suspended_until' })
  suspendedUntil: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'refresh_token' })
  @Exclude()
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date; // Soft delete

  // Relations
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Ad, (ad) => ad.user)
  ads: Ad[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => AdminPermission, (adminPermission) => adminPermission.admin)
  adminPermissions: AdminPermission[];

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.admin)
  auditLogs: AuditLog[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];
}

