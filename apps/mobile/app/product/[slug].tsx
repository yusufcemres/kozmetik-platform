import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { apiClient } from '@/services/api';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/products/slug/${slug}`)
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandName}>{product.brand?.brand_name || 'Marka'}</Text>
        <Text style={styles.productName}>{product.product_name}</Text>
        {product.category && (
          <Text style={styles.category}>{product.category.category_name}</Text>
        )}
      </View>

      {/* Score Section */}
      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Uyumluluk Skorları</Text>
        <View style={styles.scoresRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>
              {product.rank_score ? `${Math.round(product.rank_score)}%` : '—'}
            </Text>
            <Text style={styles.scoreLabel}>Genel Skor</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>—</Text>
            <Text style={styles.scoreLabel}>Kişisel Uyum</Text>
          </View>
        </View>
      </View>

      {/* Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İçerik Listesi</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde tam ingredient listesi gösterilecek
        </Text>
      </View>

      {/* Affiliate Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nereden Alınır?</Text>
        <Text style={styles.placeholder}>
          M9 sprint'inde affiliate linkler gösterilecek
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.md, color: colors.error },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandName: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: { fontSize: fontSize.sm, color: colors.textSecondary },
  scoreSection: { padding: spacing.md },
  section: { padding: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoresRow: { flexDirection: 'row', gap: spacing.sm },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  placeholder: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    textAlign: 'center',
  },
});
