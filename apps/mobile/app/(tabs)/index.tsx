import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Kozmetik Platform</Text>
        <Text style={styles.heroSubtitle}>
          Ürünlerini tanı, cildine uygun olanı bul
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.searchButtonText}>🔍 Ürün veya içerik ara...</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/scan')}
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

      {/* Popular Needs */}
      <Text style={styles.sectionTitle}>Popüler İhtiyaçlar</Text>
      <View style={styles.needsRow}>
        {['Sivilce', 'Kuruluk', 'Leke', 'Anti-Aging', 'Hassasiyet'].map(
          (need) => (
            <TouchableOpacity key={need} style={styles.needChip}>
              <Text style={styles.needChipText}>{need}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Placeholder: Popular Products */}
      <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Ürünler M2 sprint'inde yüklenecek
        </Text>
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
    backgroundColor: colors.primaryLight + '30',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  needChipText: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '500' },
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
});
