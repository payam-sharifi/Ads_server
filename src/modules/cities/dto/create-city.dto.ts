import { IsObject, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CityNameDto {
  @ApiPropertyOptional({ example: 'برلین', description: 'City name in Persian' })
  @IsString()
  @IsOptional()
  fa?: string;

  @ApiPropertyOptional({ example: 'Berlin', description: 'City name in German' })
  @IsString()
  @IsOptional()
  de?: string;

  @ApiPropertyOptional({ example: 'Berlin', description: 'City name in English' })
  @IsString()
  @IsOptional()
  en?: string;
}

/**
 * DTO for creating a city
 * 
 * Example request body:
 * {
 *   "name": { "fa": "برلین", "de": "Berlin", "en": "Berlin" }
 * }
 */
export class CreateCityDto {
  @ApiProperty({
    example: { fa: 'برلین', de: 'Berlin', en: 'Berlin' },
    description: 'City name in multiple languages',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CityNameDto)
  name: CityNameDto;
}

