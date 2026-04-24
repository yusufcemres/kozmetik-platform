import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class NeedFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'skin | body | hair | general_health' })
  @IsOptional()
  @IsString()
  need_category?: string;

  @ApiPropertyOptional({ description: 'cosmetic | supplement | both' })
  @IsOptional()
  @IsString()
  domain_type?: string;
}
