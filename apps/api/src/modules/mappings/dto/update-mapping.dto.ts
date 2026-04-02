import { PartialType } from '@nestjs/swagger';
import { CreateIngredientNeedMappingDto } from './create-mapping.dto';

export class UpdateIngredientNeedMappingDto extends PartialType(CreateIngredientNeedMappingDto) {}
