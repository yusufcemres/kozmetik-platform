import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSkinProfileDto } from './create-profile.dto';

export class UpdateSkinProfileDto extends PartialType(
  OmitType(CreateSkinProfileDto, ['anonymous_id'] as const),
) {}
