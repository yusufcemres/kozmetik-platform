import { IsString, IsOptional, IsBoolean, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'La Roche-Posay' })
  @IsString()
  @MaxLength(150)
  brand_name: string;

  @ApiPropertyOptional({ example: 'Fransa' })
  @IsOptional()
  @IsString()
  country_of_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
