import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory, PricingType } from '../../../types/category.types';

/**
 * DTO for creating a Service ad
 */
export class CreateServiceAdDto {
  // Basic fields
  @ApiProperty({ example: 'نقاشی و رنگ آمیزی منزل', description: 'Ad title' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'خدمات نقاشی و رنگ آمیزی...', description: 'Detailed description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsString()
  cityId: string;

  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.HOME_SERVICES })
  @IsEnum(ServiceCategory)
  serviceCategory: ServiceCategory;

  // Pricing
  @ApiProperty({ enum: PricingType, example: PricingType.HOURLY })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiPropertyOptional({ example: 25, description: 'Price (required if fixed or hourly)' })
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.pricingType !== PricingType.NEGOTIABLE)
  price?: number;

  // Service Area
  @ApiPropertyOptional({ example: 50, description: 'Service radius in km' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  serviceRadius?: number;

  // Trust
  @ApiPropertyOptional({ example: 5, description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'Meisterbrief', description: 'Certificates' })
  @IsString()
  @IsOptional()
  certificates?: string;

  // Contact fields removed - no longer required
}

