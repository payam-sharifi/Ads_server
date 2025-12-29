import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Ad } from './ad.entity';
import { Message } from './message.entity';

/**
 * Report entity for reporting ads or messages
 * 
 * Types:
 * - ad: Report an ad
 * - message: Report a message
 */
export enum ReportType {
  AD = 'ad',
  MESSAGE = 'message',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  @Index()
  type: ReportType;

  @Column({ type: 'uuid', nullable: true, name: 'ad_id' })
  @Index()
  adId: string;

  @Column({ type: 'uuid', nullable: true, name: 'message_id' })
  @Index()
  messageId: string;

  @Column({ type: 'uuid', name: 'reporter_id' })
  @Index()
  reporterId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Index()
  status: ReportStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => Ad, { nullable: true })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'message_id' })
  message: Message;
}

