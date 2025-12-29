import { IsOptional, IsUUID, IsNumber, IsEnum, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdStatus } from '../../../entities/ad.entity';

/**
 * DTO for filtering and paginating ads
 * 
 * Example query parameters:
 * /api/ads?categoryId=uuid&cityId=uuid&minPrice=1000&maxPrice=50000&status=active&page=1&limit=20&search=BMW
 */
export class FilterAdsDto {
  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by subcategory ID' })
  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by city ID' })
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({ example: 1000, description: 'Minimum price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ enum: AdStatus, example: AdStatus.APPROVED, description: 'Filter by status' })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;

  @ApiPropertyOptional({ example: 'BMW', description: 'Search in title and description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by user ID (owner)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)', default: 1 })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page (default: 20, max: 100)',
    default: 20,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Sort field (createdAt, price, views)',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order (ASC or DESC)',
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

