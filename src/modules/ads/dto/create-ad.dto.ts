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
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import { AdCondition } from '../../../entities/ad.entity';
import { MainCategoryType } from '../../../types/category.types';
import { CreateRealEstateAdDto } from './create-ad-real-estate.dto';
import { CreateVehicleAdDto } from './create-ad-vehicle.dto';
import { CreateServiceAdDto } from './create-ad-service.dto';
import { CreateJobAdDto } from './create-ad-job.dto';

/**
 * Unified DTO for creating an ad
 * 
 * This DTO accepts category-specific fields and validates them based on the category type.
 * The categoryId must be one of the 4 main categories (real_estate, vehicles, services, jobs).
 * 
 * Category-specific validation is handled by the AdsService based on the category type.
 */
@ApiExtraModels(CreateRealEstateAdDto, CreateVehicleAdDto, CreateServiceAdDto, CreateJobAdDto)
export class CreateAdDto {
  // Common fields
  @ApiProperty({ example: 'BMW 320d سال 2020', description: 'Ad title' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'خودروی عالی با شرایط خوب...', description: 'Detailed description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID (must be one of the 4 main categories)' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsUUID()
  cityId: string;

  @ApiProperty({ example: 25000, description: 'Price in euros (required for vehicles, optional for others)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    enum: AdCondition,
    example: AdCondition.LIKE_NEW,
    description: 'Item condition (for vehicles)',
  })
  @IsEnum(AdCondition)
  @IsOptional()
  condition?: AdCondition;

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

  // Category-specific fields (validated conditionally in service)
  // Real Estate fields
  @ApiPropertyOptional({ enum: ['sale', 'rent'], description: 'Real Estate: offer type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  offerType?: 'sale' | 'rent';

  @ApiPropertyOptional({ 
    enum: ['apartment', 'house', 'commercial', 'land', 'parking'],
    description: 'Real Estate: property type' 
  })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Real Estate: postal code' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Real Estate: district' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  district?: string;

  @ApiPropertyOptional({ description: 'Real Estate: cold rent' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  coldRent?: number;

  @ApiPropertyOptional({ description: 'Real Estate: additional costs' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  additionalCosts?: number;

  @ApiPropertyOptional({ description: 'Real Estate: deposit' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  deposit?: number;

  @ApiPropertyOptional({ description: 'Real Estate: living area in m²' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  livingArea?: number;

  @ApiPropertyOptional({ description: 'Real Estate: number of rooms' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  rooms?: number;

  @ApiPropertyOptional({ description: 'Real Estate: floor number' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  floor?: number;

  @ApiPropertyOptional({ description: 'Real Estate: total floors' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  totalFloors?: number;

  @ApiPropertyOptional({ description: 'Real Estate: year built' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  yearBuilt?: number;

  @ApiPropertyOptional({ description: 'Real Estate: available from date' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  availableFrom?: string;

  @ApiPropertyOptional({ description: 'Real Estate: furnished' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  furnished?: boolean;

  @ApiPropertyOptional({ description: 'Real Estate: balcony' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  balcony?: boolean;

  @ApiPropertyOptional({ description: 'Real Estate: elevator' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  elevator?: boolean;

  @ApiPropertyOptional({ description: 'Real Estate: parking included' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  parkingIncluded?: boolean;

  @ApiPropertyOptional({ description: 'Real Estate: cellar' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.REAL_ESTATE)
  cellar?: boolean;

  // Vehicle fields
  @ApiPropertyOptional({ enum: ['car', 'motorcycle', 'van', 'bike'], description: 'Vehicle: type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  vehicleType?: string;

  @ApiPropertyOptional({ description: 'Vehicle: brand' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  brand?: string;

  @ApiPropertyOptional({ description: 'Vehicle: model' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  model?: string;

  @ApiPropertyOptional({ description: 'Vehicle: year' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  year?: number;

  @ApiPropertyOptional({ description: 'Vehicle: mileage' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  mileage?: number;

  @ApiPropertyOptional({ enum: ['petrol', 'diesel', 'electric', 'hybrid'], description: 'Vehicle: fuel type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  fuelType?: string;

  @ApiPropertyOptional({ enum: ['manual', 'automatic'], description: 'Vehicle: transmission' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  transmission?: string;

  @ApiPropertyOptional({ description: 'Vehicle: power in HP' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  powerHP?: number;

  @ApiPropertyOptional({ enum: ['none', 'accident'], description: 'Vehicle: damage status' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  damageStatus?: string;

  @ApiPropertyOptional({ description: 'Vehicle: inspection valid until' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.VEHICLES)
  inspectionValidUntil?: string;

  // Service fields
  @ApiPropertyOptional({ 
    enum: ['home_services', 'transport', 'repairs', 'it_design', 'education', 'personal_services'],
    description: 'Service: category' 
  })
  @ValidateIf((o) => o.categoryId === MainCategoryType.SERVICES)
  serviceCategory?: string;

  @ApiPropertyOptional({ enum: ['fixed', 'hourly', 'negotiable'], description: 'Service: pricing type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.SERVICES)
  pricingType?: string;

  @ApiPropertyOptional({ description: 'Service: service radius in km' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.SERVICES)
  serviceRadius?: number;

  @ApiPropertyOptional({ description: 'Service: experience years' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.SERVICES)
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Service: certificates' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.SERVICES)
  certificates?: string;

  // Job fields
  @ApiPropertyOptional({ description: 'Job: job title' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Job: job description (overrides description if provided)' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  jobDescription?: string;

  @ApiPropertyOptional({ enum: ['full-time', 'part-time', 'mini-job', 'freelance', 'internship'], description: 'Job: type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  jobType?: string;

  @ApiPropertyOptional({ description: 'Job: industry' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  industry?: string;

  @ApiPropertyOptional({ enum: ['junior', 'mid', 'senior'], description: 'Job: experience level' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  experienceLevel?: string;

  @ApiPropertyOptional({ description: 'Job: education required' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  educationRequired?: string;

  @ApiPropertyOptional({ description: 'Job: language required' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  languageRequired?: string;

  @ApiPropertyOptional({ description: 'Job: remote possible' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  remotePossible?: boolean;

  @ApiPropertyOptional({ description: 'Job: salary from' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  salaryFrom?: number;

  @ApiPropertyOptional({ description: 'Job: salary to' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  salaryTo?: number;

  @ApiPropertyOptional({ enum: ['hourly', 'monthly'], description: 'Job: salary type' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  salaryType?: string;

  @ApiPropertyOptional({ description: 'Job: company name' })
  @ValidateIf((o) => o.categoryId === MainCategoryType.JOBS)
  companyName?: string;

  // Contact fields (used across categories)
  @ApiPropertyOptional({ description: 'Contact name' })
  @ValidateIf((o) => o.categoryId !== undefined)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @ValidateIf((o) => o.categoryId !== undefined)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @ValidateIf((o) => o.categoryId !== undefined)
  contactEmail?: string;
}
