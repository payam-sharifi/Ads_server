import { IsString, IsOptional, IsUUID, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CategoryNameDto {
  @ApiPropertyOptional({ example: 'خودرو', description: 'Category name in Persian' })
  @IsString()
  @IsOptional()
  fa?: string;

  @ApiPropertyOptional({ example: 'Fahrzeuge', description: 'Category name in German' })
  @IsString()
  @IsOptional()
  de?: string;

  @ApiPropertyOptional({ example: 'Vehicles', description: 'Category name in English' })
  @IsString()
  @IsOptional()
  en?: string;
}

/**
 * DTO for creating a category
 * 
 * Example request body:
 * {
 *   "name": { "fa": "خودرو", "de": "Fahrzeuge", "en": "Vehicles" },
 *   "icon": "🚗",
 *   "parentId": null  // null for root categories, UUID for subcategories
 * }
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: { fa: 'خودرو', de: 'Fahrzeuge', en: 'Vehicles' },
    description: 'Category name in multiple languages',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CategoryNameDto)
  name: CategoryNameDto;

  @ApiPropertyOptional({ example: '🚗', description: 'Icon (emoji or identifier)' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-parent-category',
    description: 'Parent category ID (null for root categories)',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

