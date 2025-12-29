import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ReportStatus } from '../../../entities/report.entity';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, description: 'New status for the report' })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

