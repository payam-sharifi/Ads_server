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

  @ApiPropertyOptional({ example: 'BMW', description: 'Filter by brand (vehicles)' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'X5', description: 'Filter by model (vehicles)' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2020, description: 'Minimum year (vehicles)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minYear?: number;

  @ApiPropertyOptional({ example: 2024, description: 'Maximum year (vehicles)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxYear?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Maximum mileage (vehicles)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxMileage?: number;

  @ApiPropertyOptional({ example: 'petrol', description: 'Fuel type (vehicles)' })
  @IsString()
  @IsOptional()
  fuelType?: string;

  @ApiPropertyOptional({ example: 'automatic', description: 'Transmission (vehicles)' })
  @IsString()
  @IsOptional()
  transmission?: string;

  @ApiPropertyOptional({ enum: ['new', 'like-new', 'used'], example: 'used', description: 'Item condition' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ example: 'sale', description: 'Offer type (real estate)' })
  @IsString()
  @IsOptional()
  offerType?: string;

  @ApiPropertyOptional({ example: 'apartment', description: 'Property type (real estate)' })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({ example: 50, description: 'Minimum area (real estate)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minArea?: number;

  @ApiPropertyOptional({ example: 200, description: 'Maximum area (real estate)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxArea?: number;

  @ApiPropertyOptional({ example: '3', description: 'Number of rooms (real estate)' })
  @IsString()
  @IsOptional()
  rooms?: string;

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

