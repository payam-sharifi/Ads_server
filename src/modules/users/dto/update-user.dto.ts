import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { RoleType } from '../../../entities/role.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user profile
 * 
 * All fields are optional - only provided fields will be updated
 * 
 * Example request body:
 * {
 *   "name": "Updated Name",
 *   "phone": "+49 987 654321"
 * }
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+49 123 456789', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'newPassword123', description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: RoleType, description: 'User role (admin only)' })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}

