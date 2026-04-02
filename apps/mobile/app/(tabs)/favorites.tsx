import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getFavorites,
  removeFavorite,
  FavoriteItem,
} from '@/stores/favorites';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload favorites every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      getFavorites()
        .then(setFavorites)
        .finally(() => setLoading(false));
    }, []),
  );

  const handleRemove = async (productId: number) => {
    const updated = await removeFavorite(productId);
    setFavorites(updated);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>Henüz favori eklemediniz</Text>
        <Text style={styles.emptySubtitle}>
          Beğendiğiniz ürünleri kalp ikonuna basarak favorilere ekleyebilirsiniz
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={styles.browseButtonText}>Ürünleri Keşfet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {favorites.length} favori ürün
      </Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(`/product/${item.product_slug}` as any)
            }
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={{ fontSize: 24 }}>📦</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              {item.brand_name && (
                <Text style={styles.cardBrand}>{item.brand_name}</Text>
              )}
              <Text style={styles.cardName} numberOfLines={2}>
                {item.product_name}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.added_at).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(item.product_id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeIcon}>❤️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  header: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: { padding: spacing.md, paddingTop: 0, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  cardImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  cardBrand: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  cardName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 1,
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  removeButton: {
    padding: spacing.sm,
  },
  removeIcon: { fontSize: 20 },
});
