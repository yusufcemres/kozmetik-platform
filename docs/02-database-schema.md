# Veritabanı Şeması

## Genel Bakış

37 tablo, 8 domain grubunda organize:

## Tablo Grupları

### Metodoloji (2)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `evidence_levels` | evidence_level_id | 8 kanıt seviyesi (systematic_review → anecdotal) |
| `approved_wordings` | wording_id | Güvenli ifade kütüphanesi, kategorize |

### Taxonomy (6)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `categories` | category_id | Hiyerarşik (parent_category_id self-ref), slug unique |
| `brands` | brand_id | Marka bilgileri + logo_url |
| `ingredients` | ingredient_id | INCI maddesi, flags (allergen, fragrance, preservative) |
| `ingredient_aliases` | alias_id | Alternatif isimler, trigram search |
| `ingredient_evidence_links` | evidence_link_id | PubMed/dergi kanıt referansları |
| `needs` | need_id | Kullanıcı ihtiyaçları (slug unique) |

### Ürün (7)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `product_masters` | master_id | Master ürün kaydı |
| `product_variants` | variant_id | Bölge/boyut varyantları |
| `products` | product_id | Ana ürün (brand, category FK) |
| `product_labels` | label_id | Etiket claim metinleri |
| `product_images` | image_id | Ürün görselleri (sıralı) |
| `formula_revisions` | revision_id | Formül değişiklik takibi |
| `affiliate_links` | affiliate_link_id | Satın alma linkleri (platform bazlı) |

### Engine (4)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `product_ingredients` | product_ingredient_id | Ürün-ingredient ilişkisi + order + concentration |
| `ingredient_need_mappings` | mapping_id | Ingredient-need eşleştirmesi + relevance score |
| `product_need_scores` | score_id | Hesaplanmış ürün-ihtiyaç skorları |
| `scoring_configs` | config_id | Admin ayarlanabilir scoring ağırlıkları |

### İçerik (5)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `content_articles` | article_id | Blog/rehber içerikleri |
| `product_related_articles` | id | Ürün-makale junction |
| `ingredient_related_articles` | id | Ingredient-makale junction |
| `need_related_articles` | id | İhtiyaç-makale junction |
| `sponsorship_disclosures` | disclosure_id | Sponsorluk şeffaflık kaydı |

### Supplement (Faz 2) (3)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `supplement_details` | supplement_detail_id | Ürün bazlı supplement detayları (form, serving, warnings) |
| `supplement_ingredients` | supplement_ingredient_id | Supplement besin içeriği (amount, unit, daily_value) |
| `ingredient_interactions` | interaction_id | İçerik etkileşimleri (severity, recommendation) |

### Fiyat Takibi (Faz 3) (1)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `price_history` | price_history_id | Affiliate link fiyat geçmişi (price, in_stock, currency) |

### B2B (Faz 4) (2)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `api_keys` | api_key_id | B2B API anahtarları (hash, rate limit, usage tracking) |
| `webhooks` | webhook_id | Webhook tanımları (events, auto-disable after failures) |

### Kullanıcı & Sistem (6)
| Tablo | PK | Açıklama |
|-------|-----|----------|
| `user_skin_profiles` | profile_id | Anonim cilt profili (UUID based) |
| `admin_users` | admin_user_id | Admin hesapları |
| `admin_roles` | role_id | 5 rol tanımı |
| `audit_logs` | log_id | Değişiklik audit trail |
| `user_corrections` | correction_id | Kullanıcı hata bildirimleri |
| `batch_imports` | import_id | Toplu import takibi |

## Index Stratejisi

| Index | Tablo.Kolon | Tip |
|-------|------------|-----|
| UNIQUE | `products.product_slug` | B-tree |
| UNIQUE | `ingredients.ingredient_slug` | B-tree |
| UNIQUE | `categories.category_slug` | B-tree |
| UNIQUE | `needs.need_slug` | B-tree |
| GIN trigram | `ingredient_aliases.alias_name` | pg_trgm |
| GIN trigram | `ingredients.inci_name` | pg_trgm |
| GIN full-text | `products.product_name` | pg_trgm |
| GIN trigram | `needs.need_name` | pg_trgm |
| UNIQUE | `affiliate_links(product_id, platform)` | Composite |
| UNIQUE | `user_skin_profiles.anonymous_id` | B-tree |
| INDEX | `price_history.affiliate_link_id` | B-tree |
| INDEX | `price_history.recorded_at` | B-tree DESC |
| UNIQUE | `api_keys.key_hash` | B-tree |
| UNIQUE | `api_keys.key_prefix` | B-tree |
| INDEX | `webhooks.api_key_id` | B-tree |
| INDEX | `ingredient_interactions.ingredient_a_id` | B-tree |
| INDEX | `ingredient_interactions.ingredient_b_id` | B-tree |
| INDEX | `supplement_ingredients.product_id` | B-tree |

## ER İlişki Özeti

```
ProductMaster 1──N ProductVariant 1──N Product
Product N──1 Brand
Product N──1 Category
Product 1──N ProductIngredient N──1 Ingredient
Product 1──N ProductNeedScore N──1 Need
Product 1──N AffiliateLink
Product 1──1 ProductLabel
Product 1──N ProductImage
Ingredient 1──N IngredientAlias
Ingredient 1──N IngredientEvidenceLink
Ingredient 1──N IngredientNeedMapping N──1 Need
Ingredient 1──N IngredientInteraction (A ve B tarafı)
Product 1──1 SupplementDetail (domain_type = 'supplement')
Product 1──N SupplementIngredient N──1 Ingredient
AffiliateLink 1──N PriceHistory
ApiKey 1──N Webhook
AdminUser N──1 AdminRole
```

## domain_type Pattern

`products` ve `ingredients` tablolarında `domain_type` kolonu var:
- `'cosmetic'` — Faz 1 (mevcut)
- `'supplement'` — Faz 2 (genişleme)

Bu sayede aynı tablo yapısı iki domain'i destekler.
