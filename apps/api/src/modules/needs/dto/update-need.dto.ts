import { PartialType } from '@nestjs/swagger';
import { CreateNeedDto } from './create-need.dto';

export class UpdateNeedDto extends PartialType(CreateNeedDto) {}
