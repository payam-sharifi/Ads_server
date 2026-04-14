import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user login
 * 
 * Example request body:
 * {
 *   "email": "john@example.com",
 *   "password": "securePassword123",
 *   "cf-turnstile-token": "<token from Cloudflare Turnstile>"
 * }
 */
export class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @IsNotEmpty()
  'cf-turnstile-token': string;
}

