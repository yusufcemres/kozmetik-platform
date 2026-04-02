import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInteractionDto {
  @ApiProperty()
  @IsNumber()
  ingredient_a_id: number;

  @ApiProperty()
  @IsNumber()
  ingredient_b_id: number;

  @ApiProperty({ description: 'none, mild, moderate, severe, contraindicated' })
  @IsString()
  severity: string;

  @ApiPropertyOptional({ description: 'cosmetic, supplement, both' })
  @IsString()
  @IsOptional()
  domain_type?: string;

  @ApiPropertyOptional({ description: 'ingredient, medication, food' })
  @IsString()
  @IsOptional()
  interaction_context?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommendation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source_url?: string;
}

export class UpdateInteractionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  domain_type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  interaction_context?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommendation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source_url?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
