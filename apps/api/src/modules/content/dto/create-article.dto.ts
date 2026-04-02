import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Niacinamide Rehberi: Faydaları ve Kullanımı' })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'guide' })
  @IsString()
  content_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body_markdown?: string;

  @ApiPropertyOptional({ default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  product_ids?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  ingredient_ids?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  need_ids?: number[];
}
