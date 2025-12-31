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
import { Ad } from './ad.entity';
import { MainCategoryType } from '../types/category.types';

/**
 * Category entity for organizing ads
 * 
 * Supports parent-child relationships for subcategories
 * Example: "Vehicles" (parent) -> "Cars", "Motorcycles" (children)
 * 
 * Fields:
 * - name: JSON object supporting multiple languages (fa, de, en)
 * - icon: Emoji or icon identifier
 * - parentId: Reference to parent category (null for root categories)
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  name: {
    fa?: string;
    de?: string;
    en?: string;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ 
    type: 'enum', 
    enum: MainCategoryType, 
    nullable: true,
    name: 'category_type'
  })
  @Index()
  categoryType: MainCategoryType; // The main category type (real_estate, vehicles, services, jobs)

  @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
  @Index()
  parentId: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Ad, (ad) => ad.category)
  ads: Ad[];

  @OneToMany(() => Ad, (ad) => ad.subcategory)
  subcategoryAds: Ad[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date; // Soft delete
}

