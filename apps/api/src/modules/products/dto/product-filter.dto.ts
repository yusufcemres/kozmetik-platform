import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export const PRODUCT_SORT_OPTIONS = ['newest', 'oldest', 'name', 'name_desc', 'score'] as const;
export type ProductSort = typeof PRODUCT_SORT_OPTIONS[number];

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug (parent or child)' })
  @IsOptional()
  @IsString()
  category_slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  target_area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usage_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  need_id?: string;

  @ApiPropertyOptional({ description: 'cosmetic | supplement' })
  @IsOptional()
  @IsString()
  domain_type?: string;

  @ApiPropertyOptional({ description: 'Filter by ingredient slug' })
  @IsOptional()
  @IsString()
  ingredient_slug?: string;

  @ApiPropertyOptional({ description: 'null | female | male' })
  @IsOptional()
  @IsString()
  target_gender?: string;

  @ApiPropertyOptional({ description: 'newest | oldest | name | name_desc | score', enum: PRODUCT_SORT_OPTIONS })
  @IsOptional()
  @IsIn(PRODUCT_SORT_OPTIONS as readonly string[])
  sort?: ProductSort;

  // === Sprint 6 (#13): Rich filter dimensions ===

  @ApiPropertyOptional({ description: 'Multi-select etken madde slug, virgülle ayır: c-vitamini,omega-3' })
  @IsOptional()
  @IsString()
  ingredient_slugs?: string;

  @ApiPropertyOptional({ description: 'Multi-select ihtiyaç ID, virgülle: 1,2,3' })
  @IsOptional()
  @IsString()
  need_ids?: string;

  @ApiPropertyOptional({ description: 'Multi-select form (takviye): tablet,kapsul,softgel,gummy,likit,toz,sprey,damla' })
  @IsOptional()
  @IsString()
  form?: string;

  @ApiPropertyOptional({ description: 'Sertifika cert_code multi: USP_VERIFIED,NSF_CERTIFIED,VEGAN_SOCIETY' })
  @IsOptional()
  @IsString()
  certifications?: string;

  @ApiPropertyOptional({ description: 'Hedef kitle (target_audience) multi: adult,pregnant,breastfeeding,child_4_12y' })
  @IsOptional()
  @IsString()
  target_audience?: string;

  @ApiPropertyOptional({ description: 'Üretim ülkesi ISO2 multi: TR,KR,US,FR' })
  @IsOptional()
  @IsString()
  manufacturer_country?: string;

  @ApiPropertyOptional({ description: 'REVELA skor min (0-100)' })
  @IsOptional()
  @IsString()
  score_min?: string;

  @ApiPropertyOptional({ description: 'REVELA skor max (0-100)' })
  @IsOptional()
  @IsString()
  score_max?: string;

  @ApiPropertyOptional({ description: 'Fiyat min TRY' })
  @IsOptional()
  @IsString()
  price_min?: string;

  @ApiPropertyOptional({ description: 'Fiyat max TRY' })
  @IsOptional()
  @IsString()
  price_max?: string;

  @ApiPropertyOptional({ description: 'Cilt tipi (kozmetik): oily,dry,combination,normal,sensitive' })
  @IsOptional()
  @IsString()
  skin_type?: string;

  @ApiPropertyOptional({ description: 'Ürün tipi multi (kozmetik): serum,krem,temizleyici,nemlendirici,...' })
  @IsOptional()
  @IsString()
  product_types?: string;

  @ApiPropertyOptional({ description: 'Bölge multi (kozmetik): yüz,vücut,saç,göz,dudak,el' })
  @IsOptional()
  @IsString()
  target_areas?: string;
}
