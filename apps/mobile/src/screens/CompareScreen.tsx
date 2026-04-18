import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  searchSuggest,
  getProductBySlug,
  getSupplementScore,
  getCosmeticScore,
  Product,
  SearchResult,
  SupplementScore,
  CosmeticScore,
} from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type EvidenceScore = SupplementScore | CosmeticScore;

type FullProduct = Product & {
  ingredients?: {
    product_ingredient_id: number;
    ingredient_id: number | null;
    ingredient_display_name: string;
  }[];
  supplement_detail?: { form?: string; servings_per_container?: number };
};

const SUPP_LABELS: Record<string, string> = {
  form_quality: 'Form Kalitesi',
  dose_efficacy: 'Doz Etkinliği',
  evidence_grade: 'Kanıt Seviyesi',
  third_party_testing: 'Bağımsız Test',
  interaction_safety: 'Etkileşim',
  transparency_and_tier: 'Şeffaflık',
};

const COS_LABELS: Record<string, string> = {
  active_efficacy: 'Aktif Etkinlik',
  safety_class: 'Güvenlik Sınıfı',
  concentration_fit: 'Konsantrasyon',
  interaction_safety: 'Etkileşim',
  allergen_load: 'Alerjen Yükü',
  cmr_endocrine: 'CMR/Endokrin',
  transparency: 'Şeffaflık',
};

function floorCapMessage(code?: string): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    eu_banned: 'AB yasaklı içerik',
    cmr_1a_1b: 'CMR 1A/1B madde',
    iarc_group_1: 'IARC Grup 1 karsinojen',
    endocrine_active: 'Endokrin disruptör',
    ul_exceeded: 'UL doz aşıldı',
    harmful_interactions: '≥2 zararlı etkileşim',
    low_evidence: 'Düşük kanıt seviyesi',
  };
  return map[code] || code;
}

function priceFmt(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

function barColor(val: number) {
  if (val >= 70) return colors.success;
  if (val >= 40) return colors.warning;
  return colors.error;
}

// ─── Product Slot (search + pick) ───────────────────────────────────────────

interface SlotProps {
  product: FullProduct | null;
  busy: boolean;
  onPick: (slug: string) => void;
  onRemove: () => void;
  evidence: EvidenceScore | null;
}

function ProductSlot({ product, busy, onPick, onRemove, evidence }: SlotProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showList, setShowList] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchSuggest(q);
      const items = (res.data || []).filter((s) => s.type === 'product');
      setSuggestions(items);
    } catch {
      setSuggestions([]);
    }
    setSearching(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.length >= 2) {
      setShowList(true);
      timer.current = setTimeout(() => fetchSuggestions(val), 250);
    } else {
      setShowList(false);
    }
  };

  if (product) {
    const img = product.images?.[0]?.image_url;
    return (
      <View style={styles.slotFilled}>
        <TouchableOpacity style={styles.closeBtn} onPress={onRemove}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.slotImageWrap}>
          {img ? (
            <Image source={{ uri: img }} style={styles.slotImage} />
          ) : (
            <Text style={styles.slotImagePlaceholder}>📦</Text>
          )}
        </View>
        <View style={styles.slotBody}>
          {product.brand && (
            <Text style={styles.slotBrand}>{product.brand.brand_name}</Text>
          )}
          <Text style={styles.slotName} numberOfLines={2}>
            {product.product_name}
          </Text>
          {evidence ? (
            <View style={styles.slotScoreRow}>
              <ScoreBadge
                score={evidence.overall_score}
                grade={evidence.grade}
                size="sm"
              />
              <Text style={styles.slotScoreLabel}>REVELA</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.slotEmpty}>
      <Text style={styles.slotEmptyIcon}>＋</Text>
      <Text style={styles.slotEmptyLabel}>Ürün Ekle</Text>
      <TextInput
        value={query}
        onChangeText={handleChange}
        placeholder="Ürün ara..."
        placeholderTextColor={colors.textMuted}
        style={styles.slotInput}
        editable={!busy}
      />
      {searching && (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 4 }} />
      )}
      {showList && suggestions.length > 0 && (
        <View style={styles.suggestList}>
          {suggestions.slice(0, 6).map((s) => (
            <TouchableOpacity
              key={`${s.id}-${s.slug}`}
              style={styles.suggestItem}
              onPress={() => {
                setShowList(false);
                setQuery('');
                onPick(s.slug);
              }}
            >
              <Text style={styles.suggestText} numberOfLines={2}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showList && !searching && suggestions.length === 0 && query.length >= 2 && (
        <Text style={styles.suggestEmpty}>Sonuç yok</Text>
      )}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CompareScreen() {
  const [products, setProducts] = useState<(FullProduct | null)[]>([null, null]);
  const [scores, setScores] = useState<(EvidenceScore | null)[]>([null, null]);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const loadProduct = async (index: number, slug: string) => {
    setLoadingIndex(index);
    try {
      const res = await getProductBySlug(slug);
      const prod = res.data as FullProduct;
      if (products.some((p) => p?.product_id === prod.product_id)) {
        setLoadingIndex(null);
        return;
      }
      const nextProducts = [...products];
      nextProducts[index] = prod;
      setProducts(nextProducts);

      const scoreFetcher =
        prod.domain_type === 'supplement'
          ? getSupplementScore(prod.product_id)
          : getCosmeticScore(prod.product_id);
      try {
        const scoreRes = await scoreFetcher;
        const nextScores = [...scores];
        nextScores[index] = scoreRes.data as EvidenceScore;
        setScores(nextScores);
      } catch {
        const nextScores = [...scores];
        nextScores[index] = null;
        setScores(nextScores);
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingIndex(null);
    }
  };

  const removeProduct = (index: number) => {
    const nextProducts = [...products];
    const nextScores = [...scores];
    nextProducts[index] = null;
    nextScores[index] = null;
    setProducts(nextProducts);
    setScores(nextScores);
  };

  const selected = products
    .map((p, idx) => ({ p, s: scores[idx] }))
    .filter((item): item is { p: FullProduct; s: EvidenceScore | null } => !!item.p);

  const scoredPairs = selected.filter((x) => x.s);
  const canCompareScore = scoredPairs.length >= 2;

  // Determine labels + keys (use first scored product's algorithm version)
  const isSupp =
    scoredPairs[0]?.s?.algorithm_version.startsWith('supplement') ?? false;
  const labels = isSupp ? SUPP_LABELS : COS_LABELS;
  const keys = Object.keys(labels);

  // Ingredient diff
  const allIngredientNames = new Set<string>();
  selected.forEach(({ p }) => {
    p.ingredients?.forEach((pi) =>
      allIngredientNames.add(pi.ingredient_display_name.toLowerCase()),
    );
  });
  const commonIngredients =
    selected.length >= 2
      ? [...allIngredientNames].filter((name) =>
          selected.every(({ p }) =>
            p.ingredients?.some(
              (pi) => pi.ingredient_display_name.toLowerCase() === name,
            ),
          ),
        )
      : [];

  const uniquePerProduct = selected.map(({ p }) =>
    (p.ingredients || [])
      .filter(
        (pi) =>
          !commonIngredients.includes(pi.ingredient_display_name.toLowerCase()),
      )
      .map((pi) => pi.ingredient_display_name),
  );

  // Price comparison helpers
  const minPrices = selected.map(({ p }) => {
    const prices = (p.affiliate_links || [])
      .filter((l) => l.is_active && l.price_snapshot && l.price_snapshot > 0)
      .map((l) => Number(l.price_snapshot));
    return prices.length ? Math.min(...prices) : null;
  });
  const hasAnyPrice = minPrices.some((v) => v !== null);
  const lowestPrice = hasAnyPrice
    ? Math.min(...(minPrices.filter((v): v is number => v !== null) as number[]))
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>ANALİZ</Text>
        <Text style={styles.headerTitle}>Ürün Karşılaştır</Text>
        <Text style={styles.headerSubtitle}>
          2 ürün seç, içerik ve REVELA skor farkını gör.
        </Text>
      </View>

      {/* Slots */}
      <View style={styles.slotGrid}>
        {products.map((p, idx) => (
          <ProductSlot
            key={idx}
            product={p}
            busy={loadingIndex === idx}
            evidence={scores[idx]}
            onPick={(slug) => loadProduct(idx, slug)}
            onRemove={() => removeProduct(idx)}
          />
        ))}
      </View>

      {selected.length < 2 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyText}>
            Karşılaştırmak istediğin en az 2 ürünü seç
          </Text>
          <Text style={styles.emptySubtext}>
            Yukarıdaki kutulardan ürün ara ve ekle
          </Text>
        </View>
      )}

      {/* Evidence score comparison */}
      {canCompareScore && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REVELA Skor Karşılaştırması</Text>
          <View style={styles.card}>
            {/* Overall badges row */}
            <View style={styles.overallRow}>
              {selected.map(({ p, s }) => (
                <View key={p.product_id} style={styles.overallCell}>
                  <Text style={styles.overallBrand} numberOfLines={1}>
                    {p.brand?.brand_name || ''}
                  </Text>
                  {s ? (
                    <ScoreBadge score={s.overall_score} grade={s.grade} size="lg" />
                  ) : (
                    <Text style={styles.overallMissing}>Skor yok</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Breakdown bars */}
            <View style={styles.breakdownWrap}>
              {keys.map((key) => {
                const values = selected.map(({ s }) =>
                  s ? (s.breakdown as Record<string, number>)[key] ?? null : null,
                );
                const validValues = values.filter(
                  (v): v is number => v !== null,
                );
                if (validValues.length === 0) return null;
                const maxVal = Math.max(...validValues);
                const minVal = Math.min(...validValues);
                const hasDiff = maxVal !== minVal;

                return (
                  <View key={key} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{labels[key]}</Text>
                    <View style={styles.breakdownBars}>
                      {selected.map(({ p }, idx) => {
                        const val = values[idx];
                        if (val == null) {
                          return (
                            <View
                              key={p.product_id}
                              style={styles.breakdownSlot}
                            >
                              <Text style={styles.breakdownMissing}>-</Text>
                            </View>
                          );
                        }
                        const isBest = hasDiff && val === maxVal;
                        const isWorst = hasDiff && val === minVal;
                        return (
                          <View key={p.product_id} style={styles.breakdownSlot}>
                            <View style={styles.breakdownTrack}>
                              <View
                                style={[
                                  styles.breakdownFill,
                                  {
                                    width: `${val}%`,
                                    backgroundColor: barColor(val),
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.breakdownValue,
                                isBest && { color: colors.success },
                                isWorst && { color: colors.error },
                              ]}
                            >
                              {val}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Floor cap warnings */}
            {selected.some(({ s }) => s?.floor_cap_applied) && (
              <View style={styles.floorCapBox}>
                {selected
                  .filter(({ s }) => s?.floor_cap_applied)
                  .map(({ p, s }) => (
                    <Text key={p.product_id} style={styles.floorCapText}>
                      <Text style={styles.floorCapBrand}>
                        {p.brand?.brand_name}:
                      </Text>{' '}
                      Skor tavanı — {floorCapMessage(s?.floor_cap_applied)}
                    </Text>
                  ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://kozmetik-platform.vercel.app/nasil-puanliyoruz',
              )
            }
          >
            <Text style={styles.methodologyLink}>Metodoloji hakkında bilgi al →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ingredient diff */}
      {selected.length >= 2 && allIngredientNames.size > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İçerik Karşılaştırması</Text>

          {commonIngredients.length > 0 && (
            <View style={styles.commonBox}>
              <Text style={styles.commonTitle}>
                Ortak İçerikler ({commonIngredients.length})
              </Text>
              <View style={styles.chipWrap}>
                {commonIngredients.slice(0, 24).map((name) => (
                  <View key={name} style={styles.commonChip}>
                    <Text style={styles.commonChipText}>{name}</Text>
                  </View>
                ))}
                {commonIngredients.length > 24 && (
                  <Text style={styles.chipOverflow}>
                    +{commonIngredients.length - 24}
                  </Text>
                )}
              </View>
            </View>
          )}

          {selected.map(({ p }, idx) => (
            <View key={p.product_id} style={styles.uniqueBox}>
              <Text style={styles.uniqueTitle}>
                Sadece {p.brand?.brand_name || p.product_name.slice(0, 20)}{' '}
                <Text style={styles.uniqueCount}>
                  ({uniquePerProduct[idx]?.length || 0})
                </Text>
              </Text>
              <View style={styles.chipWrap}>
                {(uniquePerProduct[idx] || []).slice(0, 16).map((name) => (
                  <View key={name} style={styles.uniqueChip}>
                    <Text style={styles.uniqueChipText} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                ))}
                {(uniquePerProduct[idx]?.length || 0) > 16 && (
                  <Text style={styles.chipOverflow}>
                    +{(uniquePerProduct[idx]?.length || 0) - 16}
                  </Text>
                )}
                {!uniquePerProduct[idx]?.length && (
                  <Text style={styles.chipEmpty}>Benzersiz içerik yok</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Price comparison */}
      {selected.length >= 2 && hasAnyPrice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fiyat Karşılaştırması</Text>
          <View style={styles.priceCard}>
            {selected.map(({ p }, idx) => {
              const price = minPrices[idx];
              const isCheapest =
                price !== null &&
                lowestPrice !== null &&
                price === lowestPrice &&
                minPrices.filter((pp) => pp === lowestPrice).length === 1;
              return (
                <View key={p.product_id} style={styles.priceCell}>
                  <Text style={styles.priceBrand} numberOfLines={1}>
                    {p.brand?.brand_name || ''}
                  </Text>
                  {price !== null ? (
                    <>
                      <Text
                        style={[
                          styles.priceValue,
                          isCheapest && { color: colors.success },
                        ]}
                      >
                        {priceFmt(price)}
                      </Text>
                      {isCheapest && (
                        <Text style={styles.priceBadge}>En ucuz</Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.priceMissing}>-</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Quick info */}
      {selected.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel Bilgiler</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marka</Text>
              <View style={styles.infoValues}>
                {selected.map(({ p }) => (
                  <Text key={p.product_id} style={styles.infoValue} numberOfLines={1}>
                    {p.brand?.brand_name || '-'}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kategori</Text>
              <View style={styles.infoValues}>
                {selected.map(({ p }) => (
                  <Text key={p.product_id} style={styles.infoValue} numberOfLines={1}>
                    {p.category?.category_name || '-'}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>İçerik Sayısı</Text>
              <View style={styles.infoValues}>
                {selected.map(({ p }) => (
                  <Text key={p.product_id} style={styles.infoValue}>
                    {p.ingredients?.length || 0}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  headerEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },

  slotGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  slotEmpty: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  slotEmptyIcon: {
    fontSize: 32,
    color: colors.textMuted,
    marginBottom: 6,
  },
  slotEmptyLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  slotInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  suggestList: {
    position: 'absolute',
    top: 160,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    maxHeight: 220,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 20,
  },
  suggestItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestText: { fontSize: fontSize.xs, color: colors.text },
  suggestEmpty: {
    marginTop: 4,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  slotFilled: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: { fontSize: 12, color: colors.text, fontWeight: '700' },
  slotImageWrap: {
    height: 110,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  slotImagePlaceholder: { fontSize: 32, color: colors.textMuted },
  slotBody: { padding: spacing.sm },
  slotBrand: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  slotName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  slotScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  slotScoreLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  section: {
    padding: spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overallCell: { alignItems: 'center', gap: 4, flex: 1 },
  overallBrand: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    maxWidth: 140,
    marginBottom: 6,
  },
  overallMissing: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  breakdownWrap: {
    padding: spacing.sm,
  },
  breakdownRow: {
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  breakdownBars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  breakdownSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    minWidth: 26,
    textAlign: 'right',
  },
  breakdownMissing: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },

  floorCapBox: {
    backgroundColor: '#FEF2F2',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  floorCapText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginBottom: 2,
  },
  floorCapBrand: { fontWeight: '700' },

  methodologyLink: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  commonBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  commonTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: spacing.sm,
  },
  commonChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  commonChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  uniqueBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  uniqueTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  uniqueCount: { color: colors.textSecondary, fontWeight: '400' },
  uniqueChip: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  uniqueChipText: {
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipOverflow: {
    fontSize: 10,
    color: colors.textMuted,
    alignSelf: 'center',
  },
  chipEmpty: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  priceCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  priceCell: {
    flex: 1,
    alignItems: 'center',
  },
  priceBrand: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  priceBadge: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  priceMissing: { color: colors.textMuted, fontSize: fontSize.sm },

  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    width: 100,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValues: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  infoValue: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
});
