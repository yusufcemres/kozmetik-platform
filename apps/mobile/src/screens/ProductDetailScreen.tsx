import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Share,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { getProductBySlug, Product } from '../services/api';
import { usePersonalScore } from '../hooks/usePersonalScore';
import { isFavorite, addFavorite, removeFavorite } from '../stores/favorites';
import { generateShareLink } from '../services/deeplink';
import ScoreBar from '../components/ScoreBar';
import AffiliateButton from '../components/AffiliateButton';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Route = RouteProp<HomeStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<Route>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const { score: personalScore } = usePersonalScore(product?.product_id ?? null);

  useEffect(() => {
    getProductBySlug(route.params.slug)
      .then((r) => {
        setProduct(r.data);
        isFavorite(r.data.product_id).then(setFav);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [route.params.slug]);

  const toggleFavorite = async () => {
    if (!product) return;
    if (fav) {
      await removeFavorite(product.product_id);
      setFav(false);
    } else {
      await addFavorite(product);
      setFav(true);
    }
  };

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

  const imageUrl = product.images?.[0]?.image_url;

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={{ fontSize: 48 }}>📦</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {product.brand && (
              <Text style={styles.brand}>{product.brand.brand_name}</Text>
            )}
            <Text style={styles.name}>{product.product_name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const url = generateShareLink('product', product.product_slug);
              Share.share({ message: `${product.product_name} - ${url}`, url });
            }}
            style={styles.favButton}
          >
            <Text style={{ fontSize: 24 }}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
            <Text style={{ fontSize: 24 }}>{fav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {product.short_description && (
          <Text style={styles.description}>{product.short_description}</Text>
        )}

        {/* Scores */}
        {product.need_scores && product.need_scores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uyumluluk Skorları</Text>
            {product.need_scores.map((ns) => (
              <ScoreBar
                key={ns.need_id}
                label={ns.need?.need_name || `İhtiyaç #${ns.need_id}`}
                score={ns.score}
                showPersonal={!!personalScore}
                personalScore={personalScore?.personal_score}
                penalties={personalScore?.penalties}
              />
            ))}
          </View>
        )}

        {/* Personal score highlight */}
        {personalScore && (
          <View style={styles.personalCard}>
            <Text style={styles.personalTitle}>Senin Cildine Uyumu</Text>
            <Text style={[
              styles.personalValue,
              { color: personalScore.personal_score >= 60 ? colors.success : colors.warning },
            ]}>
              %{Math.round(personalScore.personal_score)}
            </Text>
            {personalScore.penalties.length > 0 && (
              <Text style={styles.penaltyNote}>
                Hassasiyetlerin: {personalScore.penalties.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Ingredients list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İçerik Maddeleri</Text>
          <Text style={styles.inciText}>
            {product.ingredients?.map((pi: any) =>
              pi.ingredient?.inci_name || `#${pi.ingredient_id}`
            ).join(', ') || 'INCI analizi yapılmamış'}
          </Text>
        </View>

        {/* Affiliate */}
        {product.affiliate_links && product.affiliate_links.length > 0 && (
          <AffiliateButton links={product.affiliate_links} />
        )}

        {/* Meta */}
        <View style={styles.metaRow}>
          {product.category && (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{product.category.category_name}</Text>
            </View>
          )}
          {product.product_type_label && (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{product.product_type_label}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textMuted, fontSize: fontSize.md },
  heroImage: { width: '100%', height: 300, backgroundColor: colors.surface },
  heroPlaceholder: {
    width: '100%', height: 200, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  brand: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: 2 },
  favButton: { padding: spacing.sm },
  description: {
    fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.md,
  },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  inciText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
  personalCard: {
    backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: colors.primaryLight,
    borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.md, alignItems: 'center',
  },
  personalTitle: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '600' },
  personalValue: { fontSize: 36, fontWeight: '800', marginVertical: spacing.xs },
  penaltyNote: { fontSize: fontSize.xs, color: colors.warning, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  metaChip: {
    backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  metaText: { fontSize: fontSize.xs, color: colors.textSecondary },
});
