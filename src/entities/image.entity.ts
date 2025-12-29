import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ad } from './ad.entity';

/**
 * Image entity for ad images
 * 
 * Stores file path/URL for images associated with ads
 * Supports both local storage and cloud storage (S3, Cloudinary)
 * 
 * Fields:
 * - url: Full URL or path to the image file
 * - fileName: Original filename
 * - fileSize: File size in bytes
 * - mimeType: MIME type (image/jpeg, image/png, etc.)
 * - adId: Associated ad
 * - order: Display order for sorting multiple images
 */
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'int', name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ type: 'uuid', name: 'ad_id' })
  adId: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Ad, (ad) => ad.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;
}

