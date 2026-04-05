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
}
