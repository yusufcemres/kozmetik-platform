import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateProductInfoDto {
  @IsString()
  @IsOptional()
  short_description?: string;

  @IsString()
  @IsOptional()
  usage_instructions?: string;

  @IsString()
  @IsOptional()
  inci_list_verified?: string;

  @IsString()
  @IsOptional()
  ph_value?: string;

  @IsString()
  @IsOptional()
  formulation_type?: string;

  @IsString()
  @IsOptional()
  preservative_system?: string;

  @IsString()
  @IsOptional()
  fragrance_type?: string;

  @IsString()
  @IsOptional()
  target_skin_types?: string;

  @IsString()
  @IsOptional()
  target_gender?: string;

  @IsString()
  @IsOptional()
  manufacturing_country?: string;

  @IsString()
  @IsOptional()
  concentration_data?: string;

  @IsNumber()
  @IsOptional()
  volume_ml?: number;

  @IsBoolean()
  @IsOptional()
  is_vegan?: boolean;

  @IsBoolean()
  @IsOptional()
  is_cruelty_free?: boolean;
}
