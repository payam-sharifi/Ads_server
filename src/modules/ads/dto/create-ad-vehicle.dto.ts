import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
  ValidateIf,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, FuelType, TransmissionType, DamageStatus } from '../../../types/category.types';

/**
 * DTO for creating a Vehicle ad
 */
export class CreateVehicleAdDto {
  // Basic fields
  @ApiProperty({ example: 'BMW 320d سال 2020', description: 'Ad title' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'خودروی عالی با شرایط خوب...', description: 'Detailed description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsString()
  cityId: string;

  @ApiProperty({ example: 25000, description: 'Price in euros' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  // Vehicle Specs
  @ApiProperty({ example: 'BMW', description: 'Brand' })
  @IsString()
  @MinLength(2)
  brand: string;

  @ApiProperty({ example: '320d', description: 'Model' })
  @IsString()
  @MinLength(1)
  model: string;

  @ApiProperty({ example: 2020, description: 'Year' })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiProperty({ example: 50000, description: 'Mileage in km' })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiProperty({ enum: FuelType, example: FuelType.DIESEL })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiPropertyOptional({ example: 190, description: 'Power in HP' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  powerHP?: number;

  // Condition
  @ApiProperty({ enum: ['new', 'used'], example: 'used' })
  @IsEnum(['new', 'used'])
  condition: 'new' | 'used';

  @ApiProperty({ enum: DamageStatus, example: DamageStatus.NONE })
  @IsEnum(DamageStatus)
  damageStatus: DamageStatus;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Inspection valid until' })
  @IsDateString()
  @IsOptional()
  inspectionValidUntil?: string;

  // Location
  @ApiPropertyOptional({ example: '10115', description: 'Postal code' })
  @IsString()
  @MinLength(5)
  @IsOptional()
  postalCode?: string;

  // Contact (removed - no longer required)
}

