import {
  IsString, IsOptional, IsInt, IsNumber, MaxLength, IsArray, ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductLabelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inci_raw_text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ingredient_header_text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usage_instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warning_text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  distributor_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batch_reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiry_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pao_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  net_content_display?: string;

  @ApiPropertyOptional()
  @IsOptional()
  packaging_symbols_json?: any;

  @ApiPropertyOptional()
  @IsOptional()
  claim_texts_json?: any;
}

export class CreateProductImageDto {
  @ApiProperty()
  @IsString()
  image_url: string;

  @ApiPropertyOptional({ default: 'product' })
  @IsOptional()
  @IsString()
  image_type?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsInt()
  brand_id: number;

  @ApiProperty()
  @IsInt()
  category_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  variant_id?: number;

  @ApiProperty({ example: 'Effaclar Duo+ SPF30' })
  @IsString()
  @MaxLength(300)
  product_name: string;

  @ApiPropertyOptional({ default: 'cosmetic' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product_type_label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  short_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  net_content_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  net_content_unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  target_area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usage_time_hint?: string;

  @ApiPropertyOptional({ default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: CreateProductLabelDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductLabelDto)
  label?: CreateProductLabelDto;

  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
