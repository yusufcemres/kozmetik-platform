// Metodoloji
export { EvidenceLevel } from './evidence-level.entity';
export { ApprovedWording } from './approved-wording.entity';

// Taxonomy
export { Category } from './category.entity';
export { Brand } from './brand.entity';
export { Ingredient } from './ingredient.entity';
export { IngredientAlias } from './ingredient-alias.entity';
export { IngredientEvidenceLink } from './ingredient-evidence-link.entity';
export { Need } from './need.entity';

// Ürün
export { ProductMaster } from './product-master.entity';
export { ProductVariant } from './product-variant.entity';
export { Product } from './product.entity';
export { ProductLabel } from './product-label.entity';
export { ProductImage } from './product-image.entity';
export { FormulaRevision } from './formula-revision.entity';
export { AffiliateLink } from './affiliate-link.entity';

// Engine
export { ProductIngredient } from './product-ingredient.entity';
export { IngredientNeedMapping } from './ingredient-need-mapping.entity';
export { ProductNeedScore } from './product-need-score.entity';
export { ScoringConfig } from './scoring-config.entity';

// İçerik
export { ContentArticle } from './content-article.entity';
export { ProductRelatedArticle } from './product-related-article.entity';
export { IngredientRelatedArticle } from './ingredient-related-article.entity';
export { NeedRelatedArticle } from './need-related-article.entity';
export { SponsorshipDisclosure } from './sponsorship-disclosure.entity';

// Fiyat Takibi (Faz 3)
export { PriceHistory } from './price-history.entity';

// Supplement (Faz 2)
export { SupplementDetail } from './supplement-detail.entity';
export { SupplementIngredient } from './supplement-ingredient.entity';
export { IngredientInteraction } from './ingredient-interaction.entity';

// B2B (Faz 4)
export { ApiKey } from './api-key.entity';
export { Webhook } from './webhook.entity';

// Admin & Sistem
export { AdminRole } from './admin-role.entity';
export { AdminUser } from './admin-user.entity';
export { AuditLog } from './audit-log.entity';
export { UserCorrection } from './user-correction.entity';
export { BatchImport } from './batch-import.entity';
export { UserSkinProfile } from './user-skin-profile.entity';
