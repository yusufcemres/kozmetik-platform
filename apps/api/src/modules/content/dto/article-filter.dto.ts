import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ArticleFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'guide | ingredient_explainer | need_guide | label_reading | comparison | news' })
  @IsOptional()
  @IsString()
  content_type?: string;

  @ApiPropertyOptional({ description: 'draft | in_review | published | archived (admin only)' })
  @IsOptional()
  @IsString()
  status?: string;
}
