import { PartialType } from '@nestjs/swagger';
import { CreateAdDto } from './create-ad.dto';

/**
 * DTO for updating an ad
 * All fields are optional
 */
export class UpdateAdDto extends PartialType(CreateAdDto) {}

