import { IsString, IsOptional, IsInt, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty({ example: 'niacinamide serum' })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  // Filters
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brand_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  need_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fragrance_free?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allergen_free?: boolean;

  @ApiPropertyOptional({ description: 'cosmetic or supplement', example: 'cosmetic' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ description: 'Comma-separated ingredient IDs to include' })
  @IsOptional()
  @IsString()
  includes_ingredients?: string;

  @ApiPropertyOptional({ description: 'Comma-separated ingredient IDs to exclude' })
  @IsOptional()
  @IsString()
  excludes_ingredients?: string;
}

export class SuggestQueryDto {
  @ApiProperty({ example: 'nia' })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 8;
}
