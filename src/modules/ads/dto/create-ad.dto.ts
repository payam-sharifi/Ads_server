import {
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  MinLength,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdCondition } from '../../../entities/ad.entity';

/**
 * DTO for creating an ad
 * 
 * Example request body:
 * {
 *   "title": "BMW 320d سال 2020",
 *   "description": "خودروی عالی با شرایط خوب...",
 *   "price": 25000,
 *   "categoryId": "uuid",
 *   "subcategoryId": "uuid",  // optional
 *   "cityId": "uuid",
 *   // status is automatically set to PENDING_APPROVAL
 *   "condition": "like-new"  // optional
 * }
 */
export class CreateAdDto {
  @ApiProperty({ example: 'BMW 320d سال 2020', description: 'Ad title' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'خودروی عالی با شرایط خوب...', description: 'Detailed description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 25000, description: 'Price in euros (0 for free items)' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'uuid', description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Subcategory ID (optional)' })
  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsUUID()
  cityId: string;

  // Status is not included - ads always start as PENDING_APPROVAL

  @ApiPropertyOptional({
    enum: AdCondition,
    example: AdCondition.LIKE_NEW,
    description: 'Item condition',
  })
  @IsEnum(AdCondition)
  @IsOptional()
  condition?: AdCondition;

  @ApiPropertyOptional({
    description: 'Category-specific metadata (e.g., real estate details, vehicle specs)',
    example: {
      type: 'rent', // 'rent' or 'sale' for real estate
      rentPrice: 1200,
      deposit: 2400,
      area: 80,
      floor: 3,
      yearBuilt: 2010,
      heating: 'central',
      renovated: true,
      additionalCosts: 200,
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether to show owner email publicly',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to show owner phone publicly',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;
}

