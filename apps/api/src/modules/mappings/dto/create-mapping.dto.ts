import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngredientNeedMappingDto {
  @ApiProperty()
  @IsInt()
  ingredient_id: number;

  @ApiProperty()
  @IsInt()
  need_id: number;

  @ApiProperty({ example: 75, description: '0-100 arası ilişki skoru' })
  @IsInt()
  @Min(0)
  @Max(100)
  relevance_score: number;

  @ApiProperty({ example: 'positive', description: 'positive | negative | neutral | context_dependent' })
  @IsString()
  effect_type: string;

  @ApiPropertyOptional({ example: 'randomized_controlled' })
  @IsOptional()
  @IsString()
  evidence_level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usage_context_note?: string;
}
