import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { getFavorites, removeFavorite, FavoriteItem } from '../stores/favorites';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, []),
  );

  const handleRemove = (item: FavoriteItem) => {
    Alert.alert(
      'Favoriden Kaldır',
      `"${item.product_name}" favorilerden kaldırılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            const updated = await removeFavorite(item.product_id);
            setFavorites(updated);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyTitle}>Henüz favori ürün yok</Text>
          <Text style={styles.emptySubtitle}>
            Ürün detay sayfasından kalp ikonuna tıklayarak favori ekleyebilirsin
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.product_id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favCard}
              onPress={() => navigation.navigate('ProductDetail', { slug: item.product_slug })}
              onLongPress={() => handleRemove(item)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.favImage} />
              ) : (
                <View style={styles.favImagePlaceholder}>
                  <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
              )}
              <View style={styles.favContent}>
                {item.brand_name && (
                  <Text style={styles.favBrand}>{item.brand_name}</Text>
                )}
                <Text style={styles.favName} numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text style={styles.favDate}>
                  {new Date(item.added_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item)}
              >
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: {
    fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm,
  },
  favCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    marginHorizontal: spacing.md, marginTop: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  favImage: {
    width: 60, height: 60, borderRadius: borderRadius.sm, backgroundColor: colors.surface,
  },
  favImagePlaceholder: {
    width: 60, height: 60, borderRadius: borderRadius.sm, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  favContent: { flex: 1, marginLeft: spacing.md },
  favBrand: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  favName: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text },
  favDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  removeButton: { padding: spacing.sm },
});
