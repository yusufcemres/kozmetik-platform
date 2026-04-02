import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplementIngredientDto {
  @ApiProperty()
  @IsNumber()
  ingredient_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount_per_serving?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  daily_value_percentage?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_proprietary_blend?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class CreateSupplementDetailDto {
  @ApiProperty({ description: 'Product ID (must be domain_type=supplement)' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'tablet, capsule, softgel, powder, liquid, gummy, spray, drop' })
  @IsString()
  form: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  serving_size?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serving_unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  servings_per_container?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommended_use?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  warnings?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requires_prescription?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  manufacturer_country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certification?: string;

  @ApiPropertyOptional({ type: [SupplementIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplementIngredientDto)
  @IsOptional()
  ingredients?: SupplementIngredientDto[];
}

export class UpdateSupplementDetailDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  form?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  serving_size?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serving_unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  servings_per_container?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommended_use?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  warnings?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requires_prescription?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  manufacturer_country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certification?: string;
}
