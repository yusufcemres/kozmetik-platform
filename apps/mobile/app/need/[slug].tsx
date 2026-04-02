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
import { getNeedBySlug, Need, getProducts, Product } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function NeedDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [need, setNeed] = useState<Need | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getNeedBySlug(slug)
      .then((r) => {
        const data = r.data;
        setNeed(data);

        // If the need response includes related products, use them
        if ((data as any).top_products) {
          setTopProducts((data as any).top_products);
        } else {
          // Otherwise fetch products filtered by need
          getProducts({ search: data.need_name, limit: 10 })
            .then((pRes) => setTopProducts(pRes.data.data || []))
            .catch(() => {});
        }
      })
      .catch(() => setNeed(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!need) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>İhtiyaç bulunamadı</Text>
      </View>
    );
  }

  const needIngredients = (need as any).ingredients || [];
  const needArticles = (need as any).articles || [];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {need.icon && <Text style={styles.icon}>{need.icon}</Text>}
        <Text style={styles.needName}>{need.need_name}</Text>
        {need.description && (
          <Text style={styles.description}>{need.description}</Text>
        )}
      </View>

      {/* Key Ingredients */}
      {needIngredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkili İçerikler</Text>
          <View style={styles.ingredientGrid}>
            {needIngredients.map(
              (ing: {
                ingredient_id: number;
                inci_name: string;
                ingredient_slug: string;
                evidence_level?: string;
              }) => (
                <TouchableOpacity
                  key={ing.ingredient_id}
                  style={styles.ingredientCard}
                  onPress={() =>
                    router.push(`/ingredient/${ing.ingredient_slug}` as any)
                  }
                >
                  <Text style={styles.ingredientIcon}>🧪</Text>
                  <Text style={styles.ingredientName} numberOfLines={2}>
                    {ing.inci_name}
                  </Text>
                  {ing.evidence_level && (
                    <Text style={styles.evidenceTag}>
                      {ing.evidence_level === 'strong'
                        ? '✅ Güçlü'
                        : ing.evidence_level === 'moderate'
                          ? '🔵 Orta'
                          : '🟡 Sınırlı'}
                    </Text>
                  )}
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      )}

      {/* Top Products for this need */}
      {topProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Önerilen Ürünler</Text>
          {topProducts.map((p) => {
            const score = p.need_scores?.find(
              (ns) => ns.need_id === need.need_id,
            );
            return (
              <TouchableOpacity
                key={p.product_id}
                style={styles.productRow}
                onPress={() => router.push(`/product/${p.product_slug}` as any)}
              >
                <View style={styles.productInfo}>
                  {p.brand && (
                    <Text style={styles.productBrand}>
                      {p.brand.brand_name}
                    </Text>
                  )}
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.product_name}
                  </Text>
                </View>
                {score && (
                  <View
                    style={[
                      styles.scoreBadge,
                      {
                        backgroundColor:
                          score.score >= 70
                            ? colors.success + '20'
                            : score.score >= 40
                              ? colors.warning + '20'
                              : colors.error + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreText,
                        {
                          color:
                            score.score >= 70
                              ? colors.success
                              : score.score >= 40
                                ? colors.warning
                                : colors.error,
                        },
                      ]}
                    >
                      {Math.round(score.score)}%
                    </Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Articles */}
      {needArticles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İlgili Rehberler</Text>
          {needArticles.map(
            (article: {
              article_id: number;
              title: string;
              slug: string;
              excerpt?: string;
            }) => (
              <View key={article.article_id} style={styles.articleCard}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                {article.excerpt && (
                  <Text style={styles.articleExcerpt} numberOfLines={2}>
                    {article.excerpt}
                  </Text>
                )}
              </View>
            ),
          )}
        </View>
      )}

      {/* Empty state for products */}
      {topProducts.length === 0 && needIngredients.length === 0 && (
        <View style={styles.emptySection}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>
            Bu ihtiyaç için henüz eşleştirilmiş ürün ve içerik yok
          </Text>
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
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  icon: { fontSize: 48, marginBottom: spacing.sm },
  needName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  section: { padding: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ingredientIcon: { fontSize: 24, marginBottom: spacing.xs },
  ingredientName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  evidenceTag: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  productInfo: { flex: 1 },
  productBrand: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 1,
  },
  scoreBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  scoreText: { fontSize: fontSize.sm, fontWeight: '700' },
  chevron: { fontSize: 20, color: colors.textMuted, marginLeft: spacing.xs },
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  articleTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  articleExcerpt: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  emptySection: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
