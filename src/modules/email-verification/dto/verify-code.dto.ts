import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234', description: '4-digit verification code' })
  @IsString()
  @Length(4, 4, { message: 'کد تأیید باید ۴ رقم باشد' })
  code: string;
}

