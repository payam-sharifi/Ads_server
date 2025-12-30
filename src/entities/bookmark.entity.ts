import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Ad } from './ad.entity';

/**
 * Bookmark entity for users to save/favorite ads
 * 
 * Allows users to bookmark ads they're interested in
 * 
 * Fields:
 * - userId: User who bookmarked the ad
 * - adId: Bookmarked ad
 * - createdAt: When the bookmark was created
 */
@Entity('bookmarks')
@Unique(['userId', 'adId']) // Prevent duplicate bookmarks
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', name: 'ad_id' })
  @Index()
  adId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.bookmarks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ad, (ad) => ad.bookmarks)
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;
}

