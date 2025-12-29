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
import { Ad } from './ad.entity';

/**
 * Message entity for communication between users about ads
 * 
 * Allows buyers to contact sellers about specific ads
 * 
 * Fields:
 * - senderId: User who sent the message
 * - receiverId: Ad owner (receiver)
 * - adId: Associated ad
 * - messageText: Message content
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sender_id' })
  @Index()
  senderId: string;

  @Column({ type: 'uuid', name: 'receiver_id' })
  @Index()
  receiverId: string;

  @Column({ type: 'uuid', name: 'ad_id' })
  @Index()
  adId: string;

  @Column({ type: 'text', name: 'message_text' })
  messageText: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date; // Soft delete

  // Relations
  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => Ad, (ad) => ad.messages)
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;
}

