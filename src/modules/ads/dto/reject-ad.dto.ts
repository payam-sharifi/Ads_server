import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectAdDto {
  @ApiProperty({ description: 'Reason for rejection', example: 'Inappropriate content' })
  @IsString()
  @MinLength(10)
  reason: string;
}

