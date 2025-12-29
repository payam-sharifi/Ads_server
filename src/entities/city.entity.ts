import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ad } from './ad.entity';

/**
 * City entity representing available cities for ads
 * 
 * Supports multilingual names (Persian, German, English)
 * Used to filter and organize ads by location
 */
@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  name: {
    fa?: string;
    de?: string;
    en?: string;
  };

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date; // Soft delete

  @OneToMany(() => Ad, (ad) => ad.city)
  ads: Ad[];
}

