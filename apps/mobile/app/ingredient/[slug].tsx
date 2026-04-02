import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getIngredientBySlug, Ingredient } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

function getEwgColor(score: number): string {
  if (score <= 2) return colors.success;
  if (score <= 6) return colors.warning;
  return colors.error;
}

function getEvidenceLabel(level: string): { label: string; color: string } {
  switch (level) {
    case 'strong':
      return { label: 'Güçlü Kanıt', color: colors.success };
    case 'moderate':
      return { label: 'Orta Kanıt', color: colors.info };
    case 'limited':
      return { label: 'Sınırlı Kanıt', color: colors.warning };
    case 'insufficient':
      return { label: 'Yetersiz Kanıt', color: colors.textMuted };
    default:
      return { label: level.replace(/_/g, ' '), color: colors.textSecondary };
  }
}

export default function IngredientDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getIngredientBySlug(slug)
      .then((r) => setIngredient(r.data))
      .catch(() => setIngredient(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ingredient) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>İçerik bulunamadı</Text>
      </View>
    );
  }

  const evidence = ingredient.evidence_level
    ? getEvidenceLabel(ingredient.evidence_level)
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.inciName}>{ingredient.inci_name}</Text>
        {ingredient.common_name && (
          <Text style={styles.commonName}>{ingredient.common_name}</Text>
        )}
      </View>

      {/* Flags & Badges */}
      <View style={styles.flagsRow}>
        {ingredient.allergen_flag && (
          <View style={[styles.flagChip, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.flagText}>⚠️ Alerjen</Text>
          </View>
        )}
        {ingredient.fragrance_flag && (
          <View style={[styles.flagChip, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.flagText}>🌸 Parfüm</Text>
          </View>
        )}
        {ingredient.ingredient_group && (
          <View style={styles.flagChip}>
            <Text style={styles.flagText}>{ingredient.ingredient_group}</Text>
          </View>
        )}
        {evidence && (
          <View
            style={[styles.flagChip, { backgroundColor: evidence.color + '15' }]}
          >
            <Text style={[styles.flagText, { color: evidence.color }]}>
              {evidence.label}
            </Text>
          </View>
        )}
        {(ingredient as any).ewg_score != null && (
          <View
            style={[
              styles.flagChip,
              {
                backgroundColor:
                  getEwgColor((ingredient as any).ewg_score) + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.flagText,
                { color: getEwgColor((ingredient as any).ewg_score) },
              ]}
            >
              EWG: {(ingredient as any).ewg_score}
            </Text>
          </View>
        )}
        {(ingredient as any).origin_type && (
          <View style={styles.flagChip}>
            <Text style={styles.flagText}>
              {(ingredient as any).origin_type === 'natural'
                ? '🌿 Doğal'
                : (ingredient as any).origin_type === 'synthetic'
                  ? '🧪 Sentetik'
                  : '🔬 Yarı-sentetik'}
            </Text>
          </View>
        )}
      </View>

      {/* Function Summary */}
      {ingredient.function_summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ne İşe Yarar?</Text>
          <Text style={styles.bodyText}>{ingredient.function_summary}</Text>
        </View>
      )}

      {/* Detailed Description */}
      {ingredient.detailed_description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detaylı Bilgi</Text>
          <Text style={styles.bodyText}>{ingredient.detailed_description}</Text>
        </View>
      )}

      {/* Related Needs */}
      {(ingredient as any).need_mappings &&
        (ingredient as any).need_mappings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İlişkili İhtiyaçlar</Text>
            <View style={styles.chipsWrap}>
              {(ingredient as any).need_mappings.map(
                (nm: { need_id: number; need?: { need_name: string; need_slug: string }; score: number }) => (
                  <TouchableOpacity
                    key={nm.need_id}
                    style={styles.needChip}
                    onPress={() =>
                      nm.need?.need_slug &&
                      router.push(`/need/${nm.need.need_slug}` as any)
                    }
                  >
                    <Text style={styles.needChipText}>
                      🎯 {nm.need?.need_name || `İhtiyaç #${nm.need_id}`}
                    </Text>
                    {nm.score != null && (
                      <Text style={styles.needScore}>
                        {Math.round(nm.score)}%
                      </Text>
                    )}
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        )}

      {/* Products containing this ingredient */}
      {(ingredient as any).products &&
        (ingredient as any).products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bu İçeriği Barındıran Ürünler</Text>
            {(ingredient as any).products
              .slice(0, 10)
              .map(
                (p: {
                  product_id: number;
                  product_name: string;
                  product_slug: string;
                  brand?: { brand_name: string };
                }) => (
                  <TouchableOpacity
                    key={p.product_id}
                    style={styles.productRow}
                    onPress={() => router.push(`/product/${p.product_slug}` as any)}
                  >
                    <Text style={styles.productIcon}>📦</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.product_name}</Text>
                      {p.brand && (
                        <Text style={styles.productBrand}>
                          {p.brand.brand_name}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ),
              )}
          </View>
        )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textMuted, fontSize: fontSize.md },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inciName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  commonName: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  flagChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flagText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
  section: { padding: spacing.md, paddingTop: 0, marginTop: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  needChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: spacing.xs,
  },
  needChipText: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  needScore: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  productIcon: { fontSize: 20, marginRight: spacing.sm },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  productBrand: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
