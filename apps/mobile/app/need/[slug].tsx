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

export default function NeedDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [need, setNeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/needs/slug/${slug}`)
      .then((data) => setNeed(data))
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.needName}>{need.need_name}</Text>
        {need.description && (
          <Text style={styles.description}>{need.description}</Text>
        )}
      </View>

      {/* Key Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etkili İçerikler</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde ingredient mapping gösterilecek
        </Text>
      </View>

      {/* Recommended Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Önerilen Ürünler</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde skor bazlı ürün listesi gösterilecek
        </Text>
      </View>

      {/* Related Articles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İlgili Rehberler</Text>
        <Text style={styles.placeholder}>
          M2 sprint'inde ilgili makaleler gösterilecek
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
  needName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
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
