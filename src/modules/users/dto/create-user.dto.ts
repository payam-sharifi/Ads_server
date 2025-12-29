import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { RoleType } from '../../../entities/role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new user (signup)
 * 
 * Example request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+49 123 456789",
 *   "password": "securePassword123",
 *   "role": "user" // optional, defaults to "user"
 * }
 */
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address (must be unique)' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+49 123 456789', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    enum: RoleType, 
    example: RoleType.USER,
    description: 'User role (USER, ADMIN, SUPER_ADMIN). Defaults to USER.',
    default: RoleType.USER 
  })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}

