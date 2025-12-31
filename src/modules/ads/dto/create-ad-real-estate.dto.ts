import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  Matches,
  ValidateIf,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RealEstateOfferType, PropertyType } from '../../../types/category.types';

/**
 * DTO for creating a Real Estate ad
 */
export class CreateRealEstateAdDto {
  // Basic fields (inherited from CreateAdDto)
  @ApiProperty({ example: 'آپارتمان 2 خوابه در برلین', description: 'Ad title' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'آپارتمان زیبا و روشن...', description: 'Detailed description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsString()
  cityId: string;

  @ApiProperty({ enum: RealEstateOfferType, example: RealEstateOfferType.RENT })
  @IsEnum(RealEstateOfferType)
  offerType: RealEstateOfferType;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  // Location
  @ApiProperty({ example: '10115', description: 'Postal code' })
  @IsString()
  @MinLength(5)
  postalCode: string;

  @ApiPropertyOptional({ example: 'Mitte', description: 'District/Neighborhood' })
  @IsString()
  @IsOptional()
  district?: string;

  // Pricing
  @ApiPropertyOptional({ example: 250000, description: 'Sale price (required if sale)' })
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.offerType === RealEstateOfferType.SALE)
  price?: number;

  @ApiPropertyOptional({ example: 1200, description: 'Cold rent (required if rent)' })
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.offerType === RealEstateOfferType.RENT)
  coldRent?: number;

  @ApiPropertyOptional({ example: 200, description: 'Additional costs (Nebenkosten)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  additionalCosts?: number;

  @ApiPropertyOptional({ example: 2400, description: 'Deposit (Kaution)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deposit?: number;

  // Property Details
  @ApiProperty({ example: 80, description: 'Living area in m²' })
  @IsNumber()
  @Min(1)
  livingArea: number;

  @ApiProperty({ example: 3, description: 'Number of rooms' })
  @IsNumber()
  @Min(1)
  rooms: number;

  @ApiPropertyOptional({ example: 3, description: 'Floor number' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ example: 5, description: 'Total floors in building' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalFloors?: number;

  @ApiPropertyOptional({ example: 2010, description: 'Year built' })
  @IsNumber()
  @Min(1800)
  @IsOptional()
  yearBuilt?: number;

  @ApiPropertyOptional({ example: '2024-03-01', description: 'Available from date' })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  // Features
  @ApiPropertyOptional({ example: false, description: 'Is furnished' })
  @IsBoolean()
  @IsOptional()
  furnished?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Has balcony' })
  @IsBoolean()
  @IsOptional()
  balcony?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Has elevator' })
  @IsBoolean()
  @IsOptional()
  elevator?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Parking included' })
  @IsBoolean()
  @IsOptional()
  parkingIncluded?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Has cellar' })
  @IsBoolean()
  @IsOptional()
  cellar?: boolean;

  // Contact
  @ApiProperty({ example: 'علی محمدی', description: 'Contact name' })
  @IsString()
  @MinLength(2)
  contactName: string;

  @ApiProperty({ example: '+49123456789', description: 'Contact phone' })
  @IsString()
  @MinLength(10)
  contactPhone: string;

  @ApiPropertyOptional({ example: 'ali@example.com', description: 'Contact email' })
  @IsString()
  @IsOptional()
  contactEmail?: string;
}

