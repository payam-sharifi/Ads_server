import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';
import { ReportType } from '../../../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({ enum: ReportType, description: 'Type of report' })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ required: false, description: 'Ad ID (required if type is ad)' })
  @ValidateIf((o) => o.type === ReportType.AD)
  @IsUUID()
  adId?: string;

  @ApiProperty({ required: false, description: 'Message ID (required if type is message)' })
  @ValidateIf((o) => o.type === ReportType.MESSAGE)
  @IsUUID()
  messageId?: string;

  @ApiProperty({ description: 'Reason for reporting', minLength: 10 })
  @IsString()
  @MinLength(10)
  reason: string;
}

