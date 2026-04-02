import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngestInciDto {
  @ApiProperty()
  @IsInt()
  product_id: number;

  @ApiProperty({ example: 'Aqua, Glycerin, Niacinamide, Butylene Glycol...' })
  @IsString()
  inci_text: string;
}

export class BulkIngestDto {
  @ApiProperty({ description: 'CSV content: product_id,inci_text per row' })
  @IsString()
  csv_content: string;
}

export class MatchResultDto {
  raw: string;
  normalized: string;
  order: number;
  ingredient_id: number | null;
  ingredient_name: string | null;
  match_status: 'exact' | 'alias' | 'trigram' | 'unmatched';
  match_confidence: number;
}

export class IngestResultDto {
  product_id: number;
  total_parsed: number;
  auto_matched: number;
  suggestions: number;
  unmatched: number;
  results: MatchResultDto[];
}
