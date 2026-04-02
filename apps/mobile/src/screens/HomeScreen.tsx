import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { getProducts, getNeeds, Product, Need } from '../services/api';
import ProductCard from '../components/ProductCard';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 10 }).then((r) => setProducts(r.data.data)),
      getNeeds().then((r) => setNeeds(r.data.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      navigation.navigate('Search', { query: query.trim() });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün, içerik veya ihtiyaç ara..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Quick needs */}
      <Text style={styles.sectionTitle}>İhtiyaçlar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.needsRow}>
        {needs.map((need) => (
          <TouchableOpacity
            key={need.need_id}
            style={styles.needChip}
            onPress={() => navigation.navigate('NeedDetail', { slug: need.need_slug })}
          >
            <Text style={styles.needIcon}>{need.icon || '🎯'}</Text>
            <Text style={styles.needLabel}>{need.need_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.product_id)}
          renderItem={({ item }) => (
            <View style={{ marginRight: spacing.sm }}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { slug: item.product_slug })}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          scrollEnabled
        />
      )}

      {/* CTA */}
      <TouchableOpacity style={styles.profileCta}>
        <Text style={styles.ctaText}>🧴 Cilt profilini oluştur, sana özel öneriler al</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  searchButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  needsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  needChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  needIcon: {
    fontSize: 16,
  },
  needLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  profileCta: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
