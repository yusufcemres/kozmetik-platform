import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNeedDto {
  @ApiProperty({ example: 'Sivilce / Akne' })
  @IsString()
  @MaxLength(150)
  need_name: string;

  @ApiPropertyOptional({ default: 'cosmetic' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ example: 'Cilt Sorunları' })
  @IsOptional()
  @IsString()
  need_group?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  short_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailed_description?: string;

  @ApiPropertyOptional({ example: 'Sivilce ve akne eğilimli cilt' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  user_friendly_label?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
