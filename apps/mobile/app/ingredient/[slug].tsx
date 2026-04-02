import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { apiClient } from '@/services/api';

export default function IngredientDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [ingredient, setIngredient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/ingredients/slug/${slug}`)
      .then((data) => setIngredient(data))
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.inciName}>{ingredient.inci_name}</Text>
        {ingredient.turkish_name && (
          <Text style={styles.turkishName}>{ingredient.turkish_name}</Text>
        )}
        {ingredient.description && (
          <Text style={styles.description}>{ingredient.description}</Text>
        )}
      </View>

      {/* Safety & Origin */}
      <View style={styles.metaRow}>
        {ingredient.origin_type && (
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {ingredient.origin_type === 'natural' ? '🌿 Doğal' :
               ingredient.origin_type === 'synthetic' ? '🧪 Sentetik' :
               '🔬 Yarı-sentetik'}
            </Text>
          </View>
        )}
        {ingredient.ewg_score != null && (
          <View style={[styles.metaBadge, { backgroundColor: getEwgColor(ingredient.ewg_score) + '20' }]}>
            <Text style={[styles.metaBadgeText, { color: getEwgColor(ingredient.ewg_score) }]}>
              EWG: {ingredient.ewg_score}
            </Text>
          </View>
        )}
      </View>

      {/* Related Needs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İlişkili İhtiyaçlar</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde need mapping gösterilecek
        </Text>
      </View>

      {/* Products containing this ingredient */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bu İçeriği Barındıran Ürünler</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde ürün listesi gösterilecek
        </Text>
      </View>
    </ScrollView>
  );
}

function getEwgColor(score: number): string {
  if (score <= 2) return colors.success;
  if (score <= 6) return colors.warning;
  return colors.error;
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
  inciName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  turkishName: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  metaBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaBadgeText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text },
  section: { padding: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
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
