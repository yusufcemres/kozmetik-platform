import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { searchSuggest, getProductBySlug, Product, SearchResult } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

function ProductSlot({
  product,
  onSelect,
  onClear,
  label,
}: {
  product: Product | null;
  onSelect: () => void;
  onClear: () => void;
  label: string;
}) {
  if (!product) {
    return (
      <TouchableOpacity style={styles.slot} onPress={onSelect}>
        <Text style={styles.slotIcon}>+</Text>
        <Text style={styles.slotText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  const imageUrl = product.images?.[0]?.image_url;
  return (
    <View style={styles.slotFilled}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.slotImage} />
      ) : (
        <View style={styles.slotImagePlaceholder}>
          <Text style={{ fontSize: 24 }}>📦</Text>
        </View>
      )}
      {product.brand && (
        <Text style={styles.slotBrand} numberOfLines={1}>
          {product.brand.brand_name}
        </Text>
      )}
      <Text style={styles.slotName} numberOfLines={2}>
        {product.product_name}
      </Text>
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearText}>Değiştir</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CompareScreen() {
  const [productA, setProductA] = useState<Product | null>(null);
  const [productB, setProductB] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      try {
        const res = await searchSuggest(text);
        const items = Array.isArray(res.data) ? res.data : [];
        setSuggestions(items.filter((s: SearchResult) => s.type === 'product'));
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, []);

  const selectProduct = async (slug: string) => {
    setLoading(true);
    try {
      const res = await getProductBySlug(slug);
      if (selectingSlot === 'A') setProductA(res.data);
      else setProductB(res.data);
    } catch {}
    setSelectingSlot(null);
    setSearchQuery('');
    setSuggestions([]);
    setLoading(false);
  };

  // Comparison data
  const showComparison = productA && productB;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Product Selection */}
      {!selectingSlot ? (
        <>
          <View style={styles.slotsRow}>
            <ProductSlot
              product={productA}
              label="Ürün 1 Seç"
              onSelect={() => setSelectingSlot('A')}
              onClear={() => setProductA(null)}
            />
            <Text style={styles.vsText}>VS</Text>
            <ProductSlot
              product={productB}
              label="Ürün 2 Seç"
              onSelect={() => setSelectingSlot('B')}
              onClear={() => setProductB(null)}
            />
          </View>

          {/* Comparison Results */}
          {showComparison && (
            <View style={styles.comparisonSection}>
              {/* Need Scores Comparison */}
              {(productA.need_scores?.length || productB.need_scores?.length) ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Uyumluluk Skorları</Text>
                  {getAllNeedIds(productA, productB).map((needId) => {
                    const scoreA = productA.need_scores?.find(
                      (ns) => ns.need_id === needId,
                    );
                    const scoreB = productB.need_scores?.find(
                      (ns) => ns.need_id === needId,
                    );
                    const label =
                      scoreA?.need?.need_name ||
                      scoreB?.need?.need_name ||
                      `İhtiyaç #${needId}`;
                    return (
                      <View key={needId} style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>{label}</Text>
                        <View style={styles.scorePair}>
                          <Text
                            style={[
                              styles.scoreValue,
                              getScoreColor(scoreA?.score),
                            ]}
                          >
                            {scoreA ? `${Math.round(scoreA.score)}%` : '-'}
                          </Text>
                          <Text style={styles.scoreDivider}>|</Text>
                          <Text
                            style={[
                              styles.scoreValue,
                              getScoreColor(scoreB?.score),
                            ]}
                          >
                            {scoreB ? `${Math.round(scoreB.score)}%` : '-'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {/* Ingredients Comparison */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>İçerik Karşılaştırma</Text>
                <View style={styles.ingredientCompare}>
                  <View style={styles.ingredientCol}>
                    <Text style={styles.ingredientColTitle}>
                      {productA.product_name}
                    </Text>
                    <Text style={styles.ingredientCount}>
                      {(productA as any).ingredients?.length || '?'} içerik
                    </Text>
                  </View>
                  <View style={styles.ingredientCol}>
                    <Text style={styles.ingredientColTitle}>
                      {productB.product_name}
                    </Text>
                    <Text style={styles.ingredientCount}>
                      {(productB as any).ingredients?.length || '?'} içerik
                    </Text>
                  </View>
                </View>
              </View>

              {/* Meta Comparison */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genel Bilgi</Text>
                <View style={styles.metaCompareRow}>
                  <Text style={styles.metaLabel}>Kategori</Text>
                  <Text style={styles.metaValueA}>
                    {productA.category?.category_name || '-'}
                  </Text>
                  <Text style={styles.metaValueB}>
                    {productB.category?.category_name || '-'}
                  </Text>
                </View>
                <View style={styles.metaCompareRow}>
                  <Text style={styles.metaLabel}>Marka</Text>
                  <Text style={styles.metaValueA}>
                    {productA.brand?.brand_name || '-'}
                  </Text>
                  <Text style={styles.metaValueB}>
                    {productB.brand?.brand_name || '-'}
                  </Text>
                </View>
                <View style={styles.metaCompareRow}>
                  <Text style={styles.metaLabel}>Tür</Text>
                  <Text style={styles.metaValueA}>
                    {productA.product_type_label || '-'}
                  </Text>
                  <Text style={styles.metaValueB}>
                    {productB.product_type_label || '-'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!showComparison && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>⚖️</Text>
              <Text style={styles.infoTitle}>Ürün Karşılaştırma</Text>
              <Text style={styles.infoText}>
                İki ürünü seçerek skorlarını, içeriklerini ve özelliklerini yan
                yana karşılaştır
              </Text>
            </View>
          )}
        </>
      ) : (
        /* Search Panel */
        <View>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>
              {selectingSlot === 'A' ? 'Ürün 1' : 'Ürün 2'} Seç
            </Text>
            <TouchableOpacity onPress={() => { setSelectingSlot(null); setSearchQuery(''); setSuggestions([]); }}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün adı ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {loading && (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing.md }}
            />
          )}
          {suggestions.map((s) => (
            <TouchableOpacity
              key={`${s.type}-${s.id}`}
              style={styles.suggestionItem}
              onPress={() => selectProduct(s.slug)}
            >
              <Text style={styles.suggestionIcon}>📦</Text>
              <Text style={styles.suggestionName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getAllNeedIds(a: Product, b: Product): number[] {
  const ids = new Set<number>();
  a.need_scores?.forEach((ns) => ids.add(ns.need_id));
  b.need_scores?.forEach((ns) => ids.add(ns.need_id));
  return Array.from(ids);
}

function getScoreColor(score?: number): { color: string } {
  if (score == null) return { color: colors.textMuted };
  if (score >= 70) return { color: colors.success };
  if (score >= 40) return { color: colors.warning };
  return { color: colors.error };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  slot: {
    flex: 1,
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotIcon: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  slotText: { fontSize: fontSize.sm, color: colors.textSecondary },
  slotFilled: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  slotImage: {
    width: '100%',
    height: 80,
    backgroundColor: colors.surface,
  },
  slotImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotBrand: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  slotName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    marginTop: 2,
  },
  clearButton: { marginTop: spacing.xs },
  clearText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  vsText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textMuted,
  },
  comparisonSection: { marginTop: spacing.sm },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  scorePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreValue: { fontSize: fontSize.sm, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  scoreDivider: { color: colors.textMuted },
  ingredientCompare: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ingredientCol: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  ingredientColTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  ingredientCount: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  metaCompareRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  metaValueA: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  metaValueB: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoIcon: { fontSize: 48, marginBottom: spacing.sm },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  suggestionIcon: { fontSize: 16, marginRight: spacing.sm },
  suggestionName: { flex: 1, fontSize: fontSize.sm, color: colors.text },
});
