import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import {
  Product,
  ProductVariant,
  ProductIngredient,
  ProductNeedScore,
  Ingredient,
  IngredientNeedMapping,
  IngredientEvidenceLink,
  AffiliateLink,
  ContentArticle,
  Category,
  Brand,
  Need,
} from '@database/entities';

export interface QcCheckResult {
  check: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  items: { id: number; name: string; detail?: string }[];
}

export interface QcReport {
  generated_at: string;
  total_issues: number;
  critical: number;
  warnings: number;
  info: number;
  checks: QcCheckResult[];
}

@Injectable()
export class QcService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
    @InjectRepository(ProductNeedScore)
    private readonly scoreRepo: Repository<ProductNeedScore>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(IngredientNeedMapping)
    private readonly mappingRepo: Repository<IngredientNeedMapping>,
    @InjectRepository(IngredientEvidenceLink)
    private readonly evidenceRepo: Repository<IngredientEvidenceLink>,
    @InjectRepository(AffiliateLink)
    private readonly affiliateRepo: Repository<AffiliateLink>,
    @InjectRepository(ContentArticle)
    private readonly articleRepo: Repository<ContentArticle>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Need)
    private readonly needRepo: Repository<Need>,
  ) {}

  async runFullReport(): Promise<QcReport> {
    const checks = await Promise.all([
      this.checkProductsWithoutIngredients(),
      this.checkProductsWithoutScores(),
      this.checkIngredientsWithoutEvidence(),
      this.checkIngredientsWithoutMappings(),
      this.checkOrphanedVariants(),
      this.checkProductsWithoutAffiliateLinks(),
      this.checkDraftProducts(),
      this.checkEmptyCategories(),
      this.checkUnusedBrands(),
      this.checkProductsWithoutImages(),
      this.checkArticlesUnpublished(),
      this.checkDuplicateIngredientNames(),
      this.checkNeedsWithoutMappings(),
    ]);

    const total_issues = checks.reduce((sum, c) => sum + c.count, 0);
    const critical = checks.filter((c) => c.severity === 'critical').reduce((s, c) => s + c.count, 0);
    const warnings = checks.filter((c) => c.severity === 'warning').reduce((s, c) => s + c.count, 0);
    const info = checks.filter((c) => c.severity === 'info').reduce((s, c) => s + c.count, 0);

    return {
      generated_at: new Date().toISOString(),
      total_issues,
      critical,
      warnings,
      info,
      checks,
    };
  }

  // 1. Ingredient'sız ürünler
  async checkProductsWithoutIngredients(): Promise<QcCheckResult> {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.ingredients', 'pi')
      .where('pi.product_ingredient_id IS NULL')
      .select(['p.product_id', 'p.product_name'])
      .getMany();

    return {
      check: 'products_without_ingredients',
      description: 'INCI analizi yapılmamış ürünler',
      severity: 'critical',
      count: products.length,
      items: products.map((p) => ({ id: p.product_id, name: p.product_name })),
    };
  }

  // 2. Score'suz ürünler
  async checkProductsWithoutScores(): Promise<QcCheckResult> {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.need_scores', 'ns')
      .where('ns.product_need_score_id IS NULL')
      .select(['p.product_id', 'p.product_name'])
      .getMany();

    return {
      check: 'products_without_scores',
      description: 'Need skoru hesaplanmamış ürünler',
      severity: 'critical',
      count: products.length,
      items: products.map((p) => ({ id: p.product_id, name: p.product_name })),
    };
  }

  // 3. Evidence'sız ingredient'lar
  async checkIngredientsWithoutEvidence(): Promise<QcCheckResult> {
    const ingredients = await this.ingredientRepo
      .createQueryBuilder('i')
      .leftJoin('i.evidence_links', 'el')
      .where('el.link_id IS NULL')
      .select(['i.ingredient_id', 'i.inci_name'])
      .getMany();

    return {
      check: 'ingredients_without_evidence',
      description: 'Kanıt bağlantısı olmayan ingredient\'lar',
      severity: 'warning',
      count: ingredients.length,
      items: ingredients.map((i) => ({ id: i.ingredient_id, name: i.inci_name })),
    };
  }

  // 4. Need mapping'siz ingredient'lar
  async checkIngredientsWithoutMappings(): Promise<QcCheckResult> {
    const allIngredients = await this.ingredientRepo.find({ select: ['ingredient_id', 'inci_name'] });
    const mappedIds = await this.mappingRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.ingredient_id', 'ingredient_id')
      .getRawMany();
    const mappedSet = new Set(mappedIds.map((r) => r.ingredient_id));

    const unmapped = allIngredients.filter((i) => !mappedSet.has(i.ingredient_id));

    return {
      check: 'ingredients_without_mappings',
      description: 'Hiçbir ihtiyaçla eşleştirilmemiş ingredient\'lar',
      severity: 'warning',
      count: unmapped.length,
      items: unmapped.map((i) => ({ id: i.ingredient_id, name: i.inci_name })),
    };
  }

  // 5. Orphaned variant'lar (ürünsüz)
  async checkOrphanedVariants(): Promise<QcCheckResult> {
    const variants = await this.variantRepo
      .createQueryBuilder('v')
      .leftJoin('v.products', 'p')
      .where('p.product_id IS NULL')
      .select(['v.variant_id', 'v.size_label', 'v.region'])
      .getMany();

    return {
      check: 'orphaned_variants',
      description: 'Ürünü olmayan variant kayıtları',
      severity: 'warning',
      count: variants.length,
      items: variants.map((v) => ({
        id: v.variant_id,
        name: `Variant #${v.variant_id}`,
        detail: `${v.region || '?'} / ${v.size_label || '?'}`,
      })),
    };
  }

  // 6. Affiliate link'siz ürünler
  async checkProductsWithoutAffiliateLinks(): Promise<QcCheckResult> {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.affiliate_links', 'al')
      .where('al.affiliate_link_id IS NULL')
      .andWhere('p.status = :status', { status: 'published' })
      .select(['p.product_id', 'p.product_name'])
      .getMany();

    return {
      check: 'products_without_affiliate_links',
      description: 'Yayınlanmış ancak affiliate linki olmayan ürünler',
      severity: 'info',
      count: products.length,
      items: products.map((p) => ({ id: p.product_id, name: p.product_name })),
    };
  }

  // 7. Draft durumundaki ürünler
  async checkDraftProducts(): Promise<QcCheckResult> {
    const products = await this.productRepo.find({
      where: { status: 'draft' },
      select: ['product_id', 'product_name', 'status'],
    });

    return {
      check: 'draft_products',
      description: 'Hâlâ draft durumunda olan ürünler',
      severity: 'info',
      count: products.length,
      items: products.map((p) => ({ id: p.product_id, name: p.product_name })),
    };
  }

  // 8. Ürünsüz kategoriler
  async checkEmptyCategories(): Promise<QcCheckResult> {
    const categories = await this.categoryRepo
      .createQueryBuilder('c')
      .leftJoin(Product, 'p', 'p.category_id = c.category_id')
      .where('p.product_id IS NULL')
      .select(['c.category_id', 'c.category_name'])
      .getMany();

    return {
      check: 'empty_categories',
      description: 'Hiç ürün içermeyen kategoriler',
      severity: 'info',
      count: categories.length,
      items: categories.map((c) => ({ id: c.category_id, name: c.category_name })),
    };
  }

  // 9. Kullanılmayan markalar
  async checkUnusedBrands(): Promise<QcCheckResult> {
    const brands = await this.brandRepo
      .createQueryBuilder('b')
      .leftJoin(Product, 'p', 'p.brand_id = b.brand_id')
      .where('p.product_id IS NULL')
      .select(['b.brand_id', 'b.brand_name'])
      .getMany();

    return {
      check: 'unused_brands',
      description: 'Hiç ürünü olmayan markalar',
      severity: 'info',
      count: brands.length,
      items: brands.map((b) => ({ id: b.brand_id, name: b.brand_name })),
    };
  }

  // 10. Görselsiz ürünler
  async checkProductsWithoutImages(): Promise<QcCheckResult> {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.images', 'img')
      .where('img.image_id IS NULL')
      .select(['p.product_id', 'p.product_name'])
      .getMany();

    return {
      check: 'products_without_images',
      description: 'Görsel yüklenmemiş ürünler',
      severity: 'warning',
      count: products.length,
      items: products.map((p) => ({ id: p.product_id, name: p.product_name })),
    };
  }

  // 11. Yayınlanmamış makaleler
  async checkArticlesUnpublished(): Promise<QcCheckResult> {
    const articles = await this.articleRepo.find({
      where: { status: Not('published') },
      select: ['article_id', 'title', 'status'],
    });

    return {
      check: 'unpublished_articles',
      description: 'Yayınlanmamış makaleler',
      severity: 'info',
      count: articles.length,
      items: articles.map((a) => ({
        id: a.article_id,
        name: a.title,
        detail: a.status,
      })),
    };
  }

  // 12. Duplicate ingredient isimleri (case-insensitive)
  async checkDuplicateIngredientNames(): Promise<QcCheckResult> {
    const duplicates = await this.ingredientRepo
      .createQueryBuilder('i')
      .select('LOWER(i.inci_name)', 'lower_name')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('LOWER(i.inci_name)')
      .having('COUNT(*) > 1')
      .getRawMany();

    return {
      check: 'duplicate_ingredient_names',
      description: 'Aynı INCI ismine sahip birden fazla kayıt',
      severity: 'critical',
      count: duplicates.length,
      items: duplicates.map((d, idx) => ({
        id: idx + 1,
        name: d.lower_name,
        detail: `${d.cnt} kayıt`,
      })),
    };
  }

  // 13. Mapping'siz need'ler
  async checkNeedsWithoutMappings(): Promise<QcCheckResult> {
    const allNeeds = await this.needRepo.find({ select: ['need_id', 'need_name'] });
    const mappedIds = await this.mappingRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.need_id', 'need_id')
      .getRawMany();
    const mappedSet = new Set(mappedIds.map((r) => r.need_id));

    const unmapped = allNeeds.filter((n) => !mappedSet.has(n.need_id));

    return {
      check: 'needs_without_mappings',
      description: 'Hiçbir ingredient ile eşleştirilmemiş ihtiyaçlar',
      severity: 'warning',
      count: unmapped.length,
      items: unmapped.map((n) => ({ id: n.need_id, name: n.need_name })),
    };
  }

  // CSV export helper
  generateCsv(report: QcReport): string {
    const lines: string[] = ['Check,Severity,Count,Item ID,Item Name,Detail'];

    for (const check of report.checks) {
      if (check.items.length === 0) {
        lines.push(`"${check.check}","${check.severity}",0,,,"Sorun yok"`);
      } else {
        for (const item of check.items) {
          lines.push(
            `"${check.check}","${check.severity}",${check.count},${item.id},"${item.name}","${item.detail || ''}"`,
          );
        }
      }
    }

    return lines.join('\n');
  }
}
