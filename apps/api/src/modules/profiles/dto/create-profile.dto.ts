import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkinProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @MaxLength(100)
  anonymous_id: string;

  @ApiPropertyOptional({ example: 'oily' })
  @IsOptional()
  @IsString()
  skin_type?: string;

  @ApiPropertyOptional({ example: [1, 3, 5], description: 'Need ID listesi' })
  @IsOptional()
  @IsArray()
  concerns?: number[];

  @ApiPropertyOptional({
    example: { fragrance: true, alcohol: false, paraben: false, essential_oils: false },
  })
  @IsOptional()
  sensitivities?: Record<string, boolean>;

  @ApiPropertyOptional({ example: '25-34' })
  @IsOptional()
  @IsString()
  age_range?: string;
}
