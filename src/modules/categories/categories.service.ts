import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * Categories Service
 * 
 * Handles category business logic:
 * - List all categories (with children)
 * - Get category by ID
 * - Create category/subcategory
 * - Update category
 * - Delete category (soft delete)
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * Find all categories with their children
   * Returns root categories with nested subcategories
   */
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parentId: null, deletedAt: null },
      relations: ['children'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find category by ID with children
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Create a new category or subcategory
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // If parentId is provided, verify parent exists
    if (createCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: createCategoryDto.parentId, deletedAt: null },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      parentId: createCategoryDto.parentId || null,
    });

    return this.categoriesRepository.save(category);
  }

  /**
   * Update category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // If parentId is being updated, verify parent exists and prevent circular references
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      if (updateCategoryDto.parentId) {
        const parent = await this.categoriesRepository.findOne({
          where: { id: updateCategoryDto.parentId, deletedAt: null },
        });

        if (!parent) {
          throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
        }

        // Check for circular reference (prevent making a descendant a parent)
        const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
        if (isDescendant) {
          throw new ConflictException('Circular reference detected');
        }
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  /**
   * Soft delete category
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.categoriesRepository.save(category);
  }

  /**
   * Helper: Check if a category is a descendant of another
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const category = await this.categoriesRepository.findOne({
      where: { id: descendantId },
      relations: ['parent'],
    });

    if (!category || !category.parentId) {
      return false;
    }

    if (category.parentId === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, category.parentId);
  }
}

