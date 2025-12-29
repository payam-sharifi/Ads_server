import {
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  MinLength,
  Min,
  IsArray,
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
}

