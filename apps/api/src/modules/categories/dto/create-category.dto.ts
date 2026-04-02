import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Yüz Bakım' })
  @IsString()
  @MaxLength(150)
  category_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parent_category_id?: number;

  @ApiPropertyOptional({ default: 'cosmetic' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sort_order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
