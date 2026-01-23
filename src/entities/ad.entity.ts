import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { City } from './city.entity';
import { Image } from './image.entity';
import { Message } from './message.entity';
import { Bookmark } from './bookmark.entity';

/**
 * Ad entity representing classified advertisements
 * 
 * Status values:
 * - DRAFT: Ad is being created/edited by user
 * - PENDING_APPROVAL: Awaiting admin approval
 * - APPROVED: Approved and visible publicly
 * - REJECTED: Rejected by admin (with reason)
 * - EXPIRED: Ad has expired
 * 
 * Condition values:
 * - 'new': Brand new item
 * - 'like-new': Like new condition
 * - 'used': Used item
 * 
 * Fields:
 * - title: Ad title
 * - description: Detailed description
 * - price: Price in euros (0 for free items or services)
 * - categoryId: Main category
 * - subcategoryId: Optional subcategory
 * - userId: Ad owner
 * - cityId: Location
 * - status: Current status
 * - condition: Item condition (optional)
 * - views: View counter
 * - isPremium: Premium ad flag
 * - rejectionReason: Reason for rejection (if rejected)
 */
export enum AdStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED', // Temporarily hidden by admin
}

export enum AdCondition {
  NEW = 'new',
  LIKE_NEW = 'like-new',
  USED = 'used',
}

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'uuid', name: 'category_id' })
  @Index()
  categoryId: string;

  @Column({ type: 'uuid', nullable: true, name: 'subcategory_id' })
  @Index()
  subcategoryId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', name: 'city_id', nullable: true })
  @Index()
  cityId: string;

  @Column({
    type: 'enum',
    enum: AdStatus,
    default: AdStatus.PENDING_APPROVAL,
  })
  @Index()
  status: AdStatus;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
  approvedBy: string;

  @Column({ type: 'uuid', nullable: true, name: 'rejected_by' })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_at' })
  rejectedAt: Date;

  @Column({
    type: 'enum',
    enum: AdCondition,
    nullable: true,
  })
  condition: AdCondition;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'boolean', default: false, name: 'is_premium' })
  isPremium: boolean;

  @Column({ type: 'boolean', default: false, name: 'show_email' })
  showEmail: boolean; // Whether to show owner's email publicly

  @Column({ type: 'boolean', default: false, name: 'show_phone' })
  showPhone: boolean; // Whether to show owner's phone publicly

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Category-specific fields (e.g., real estate details, vehicle specs)

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date; // Soft delete

  // Relations
  @ManyToOne(() => User, (user) => user.ads)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.ads)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Category, (category) => category.subcategoryAds, { nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Category;

  @ManyToOne(() => City, (city) => city.ads)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => Image, (image) => image.ad)
  images: Image[];

  @OneToMany(() => Message, (message) => message.ad)
  messages: Message[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rejected_by' })
  rejector: User;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.ad)
  bookmarks: Bookmark[];
}

