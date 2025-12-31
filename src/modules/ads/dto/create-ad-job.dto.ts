import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, ExperienceLevel, SalaryType } from '../../../types/category.types';

/**
 * DTO for creating a Job ad
 */
export class CreateJobAdDto {
  // Basic fields
  @ApiProperty({ example: 'توسعه‌دهنده Full Stack', description: 'Job title (used as ad title)' })
  @IsString()
  @MinLength(3)
  jobTitle: string;

  @ApiProperty({ example: 'ما در حال جستجوی یک توسعه‌دهنده...', description: 'Job description' })
  @IsString()
  @MinLength(10)
  jobDescription: string;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsString()
  cityId: string;

  @ApiProperty({ enum: JobType, example: JobType.FULL_TIME })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ example: 'IT & Software', description: 'Industry' })
  @IsString()
  @MinLength(2)
  industry: string;

  // Requirements
  @ApiPropertyOptional({ enum: ExperienceLevel, example: ExperienceLevel.MID })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ example: 'Bachelor in Computer Science', description: 'Education required' })
  @IsString()
  @IsOptional()
  educationRequired?: string;

  @ApiPropertyOptional({ example: 'German B2, English C1', description: 'Language requirements' })
  @IsString()
  @IsOptional()
  languageRequired?: string;

  @ApiPropertyOptional({ example: true, description: 'Remote work possible' })
  @IsBoolean()
  @IsOptional()
  remotePossible?: boolean;

  // Salary
  @ApiPropertyOptional({ example: 45000, description: 'Salary from' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryFrom?: number;

  @ApiPropertyOptional({ example: 60000, description: 'Salary to' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryTo?: number;

  @ApiPropertyOptional({ enum: SalaryType, example: SalaryType.MONTHLY })
  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  // Contact
  @ApiProperty({ example: 'Tech Startup GmbH', description: 'Company name' })
  @IsString()
  @MinLength(2)
  companyName: string;

  // Contact fields removed - no longer required (companyName is still required)
}

