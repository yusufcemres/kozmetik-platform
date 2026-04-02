import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getProducts, getNeeds, Product, Need } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    await Promise.all([
      getProducts({ page: 1, limit: 8 })
        .then((r) => setPopularProducts(r.data.data || []))
        .catch(() => {}),
      getNeeds()
        .then((r) => setNeeds(r.data.data || []))
        .catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Kozmetik Platform</Text>
        <Text style={styles.heroSubtitle}>
          Ürünlerini tanı, cildine uygun olanı bul
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={styles.searchButtonText}>🔍 Ürün veya içerik ara...</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Barkod Tara</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/routine')}
        >
          <Text style={styles.actionIcon}>✨</Text>
          <Text style={styles.actionLabel}>Rutin Oluştur</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/compare')}
        >
          <Text style={styles.actionIcon}>⚖️</Text>
          <Text style={styles.actionLabel}>Karşılaştır</Text>
        </TouchableOpacity>
      </View>

      {/* Needs / Concerns */}
      <Text style={styles.sectionTitle}>Cilt İhtiyaçları</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
      ) : (
        <View style={styles.needsRow}>
          {needs.map((need) => (
            <TouchableOpacity
              key={need.need_id}
              style={styles.needChip}
              onPress={() => router.push(`/need/${need.need_slug}` as any)}
            >
              {need.icon && <Text style={styles.needIcon}>{need.icon}</Text>}
              <Text style={styles.needChipText}>{need.need_name}</Text>
            </TouchableOpacity>
          ))}
          {needs.length === 0 && (
            <Text style={styles.emptyHint}>Henüz ihtiyaç tanımlanmamış</Text>
          )}
        </View>
      )}

      {/* Popular Products */}
      <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
      ) : popularProducts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productScroll}
        >
          {popularProducts.map((product) => {
            const imageUrl = product.images?.[0]?.image_url;
            return (
              <TouchableOpacity
                key={product.product_id}
                style={styles.productCard}
                onPress={() =>
                  router.push(`/product/${product.product_slug}` as any)
                }
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={{ fontSize: 28 }}>📦</Text>
                  </View>
                )}
                {product.brand && (
                  <Text style={styles.productBrand} numberOfLines={1}>
                    {product.brand.brand_name}
                  </Text>
                )}
                <Text style={styles.productName} numberOfLines={2}>
                  {product.product_name}
                </Text>
                {product.need_scores && product.need_scores.length > 0 && (
                  <View style={styles.productScoreBadge}>
                    <Text style={styles.productScoreText}>
                      {Math.round(
                        product.need_scores.reduce((s, ns) => s + ns.score, 0) /
                          product.need_scores.length,
                      )}
                      %
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Henüz ürün eklenmemiş
          </Text>
        </View>
      )}

      {/* Profile CTA */}
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Kişisel Analizini Yap</Text>
        <Text style={styles.ctaDescription}>
          Cilt tipini ve hassasiyetlerini belirle, sana özel uyumluluk skorları gör
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.ctaButtonText}>Profilimi Oluştur</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  searchButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  needsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  needChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '30',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    gap: 4,
  },
  needIcon: { fontSize: 14 },
  needChipText: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: spacing.sm,
  },
  productScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  productCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBrand: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  productScoreBadge: {
    backgroundColor: colors.success + '15',
    borderTopWidth: 1,
    borderTopColor: colors.success + '20',
    paddingVertical: 4,
    alignItems: 'center',
  },
  productScoreText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.success,
  },
  placeholder: {
    margin: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.sm },
  ctaCard: {
    margin: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#F0FDFA',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  ctaDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
  },
  ctaButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
});
