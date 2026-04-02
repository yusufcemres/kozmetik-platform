import {
  IsString, IsOptional, IsBoolean, MaxLength, IsArray, ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAliasDto {
  @ApiProperty({ example: 'Hyaluronik Asit' })
  @IsString()
  @MaxLength(250)
  alias_name: string;

  @ApiPropertyOptional({ default: 'tr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ default: 'common' })
  @IsOptional()
  @IsString()
  alias_type?: string;
}

export class CreateEvidenceLinkDto {
  @ApiProperty({ example: 'https://pubmed.ncbi.nlm.nih.gov/12345678/' })
  @IsString()
  source_url: string;

  @ApiProperty({ example: 'Hyaluronic Acid in Dermatology' })
  @IsString()
  @MaxLength(250)
  source_title: string;

  @ApiPropertyOptional({ example: 'pubmed' })
  @IsOptional()
  @IsString()
  source_type?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  publication_year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary_note?: string;
}

export class CreateIngredientDto {
  @ApiProperty({ example: 'Hyaluronic Acid' })
  @IsString()
  @MaxLength(250)
  inci_name: string;

  @ApiPropertyOptional({ example: 'Hyaluronik Asit' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  common_name?: string;

  @ApiPropertyOptional({ default: 'cosmetic' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ example: 'Nemlendirici' })
  @IsOptional()
  @IsString()
  ingredient_group?: string;

  @ApiPropertyOptional({ example: 'synthetic' })
  @IsOptional()
  @IsString()
  origin_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  function_summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailed_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sensitivity_note?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allergen_flag?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fragrance_flag?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  preservative_flag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence_level?: string;

  @ApiPropertyOptional({ type: [CreateAliasDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAliasDto)
  aliases?: CreateAliasDto[];

  @ApiPropertyOptional({ type: [CreateEvidenceLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvidenceLinkDto)
  evidence_links?: CreateEvidenceLinkDto[];
}
