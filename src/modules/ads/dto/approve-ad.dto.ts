import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveAdDto {
  @ApiPropertyOptional({ description: 'Optional notes for approval' })
  notes?: string;
}

