import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Product } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface Props {
  product: Product;
  onPress: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, onPress, compact }: Props) {
  const imageUrl = product.images?.[0]?.image_url;
  const brandName = product.brand?.brand_name;

  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.image, compact && styles.imageCompact]} />
      ) : (
        <View style={[styles.imagePlaceholder, compact && styles.imageCompact]}>
          <Text style={styles.placeholderIcon}>📦</Text>
        </View>
      )}
      <View style={styles.content}>
        {brandName && <Text style={styles.brand}>{brandName}</Text>}
        <Text style={styles.name} numberOfLines={2}>
          {product.product_name}
        </Text>
        {product.product_type_label && (
          <Text style={styles.type}>{product.product_type_label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    width: 160,
  },
  cardCompact: {
    width: '100%',
    flexDirection: 'row',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
  },
  imageCompact: {
    width: 80,
    height: 80,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  content: {
    padding: spacing.sm,
    flex: 1,
  },
  brand: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  type: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
