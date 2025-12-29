import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO for updating a category
 * All fields are optional
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

