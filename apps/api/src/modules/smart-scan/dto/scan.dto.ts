import { IsBase64, IsIn, IsOptional, IsString, MaxLength, Matches, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Smart-Scan request body validation.
 *
 * - En az biri zorunlu: `barcode` veya `image_base64`
 * - `image_base64`: 5MB binary (~6.7MB base64) limiti; data URI prefix ('data:image/...;base64,') opsiyonel
 * - `image_mime`: vision endpoint için zorunlu; sadece jpeg/png/webp kabul ediliyor
 * - `user_id` ve `ip` controller içinde set edilir, body üzerinden gönderilemez (forbidNonWhitelisted)
 */
export class SmartScanRequestDto {
  @ApiPropertyOptional({ example: '8690000000001', description: 'EAN/UPC barkod (8-14 hane)' })
  @IsOptional()
  @IsString()
  @MaxLength(14)
  @Matches(/^[0-9]{8,14}$/, { message: 'barcode 8-14 haneli sayı olmalı' })
  barcode?: string;

  @ApiPropertyOptional({ description: 'Foto base64 (max ~6.7MB, data URI prefix opsiyonel)' })
  @IsOptional()
  @IsString()
  @MaxLength(7_000_000, { message: 'image_base64 5MB binary sınırını aşıyor' })
  @Matches(/^(data:image\/(jpeg|jpg|png|webp);base64,)?[A-Za-z0-9+/]+={0,2}$/, {
    message: 'image_base64 geçerli base64 (jpeg/png/webp) olmalı',
  })
  image_base64?: string;

  @ApiPropertyOptional({ example: 'image/jpeg', enum: ['image/jpeg', 'image/png', 'image/webp'] })
  @ValidateIf((o) => !!o.image_base64)
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'image_mime sadece image/jpeg, image/png veya image/webp olabilir',
  })
  image_mime?: string;
}
