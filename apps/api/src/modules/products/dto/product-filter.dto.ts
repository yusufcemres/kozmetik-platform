import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug (parent or child)' })
  @IsOptional()
  @IsString()
  category_slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  target_area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usage_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  need_id?: string;

  @ApiPropertyOptional({ description: 'cosmetic | supplement' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ description: 'Filter by ingredient slug' })
  @IsOptional()
  @IsString()
  ingredient_slug?: string;

  @ApiPropertyOptional({ description: 'null | female | male' })
  @IsOptional()
  @IsString()
  target_gender?: string;
}
