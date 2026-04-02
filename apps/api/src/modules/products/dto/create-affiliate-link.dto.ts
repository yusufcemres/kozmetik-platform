import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffiliateLinkDto {
  @ApiProperty({ example: 'trendyol' })
  @IsString()
  @MaxLength(50)
  platform: string;

  @ApiProperty({ example: 'https://www.trendyol.com/...' })
  @IsString()
  @MaxLength(1000)
  affiliate_url: string;

  @ApiPropertyOptional({ example: 189.90 })
  @IsOptional()
  @IsNumber()
  price_snapshot?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
