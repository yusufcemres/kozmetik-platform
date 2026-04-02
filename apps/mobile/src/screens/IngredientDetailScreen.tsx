import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { getIngredientBySlug, Ingredient } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Route = RouteProp<HomeStackParamList, 'IngredientDetail'>;

export default function IngredientDetailScreen() {
  const route = useRoute<Route>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIngredientBySlug(route.params.slug)
      .then((r) => setIngredient(r.data))
      .catch(() => setIngredient(null))
      .finally(() => setLoading(false));
  }, [route.params.slug]);

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.inciName}>{ingredient.inci_name}</Text>
        {ingredient.common_name && (
          <Text style={styles.commonName}>{ingredient.common_name}</Text>
        )}

        {/* Flags */}
        <View style={styles.flagsRow}>
          {ingredient.allergen_flag && (
            <View style={[styles.flagChip, { backgroundColor: '#FEF2F2' }]}>
              <Text style={styles.flagText}>⚠️ Alerjen</Text>
            </View>
          )}
          {ingredient.fragrance_flag && (
            <View style={[styles.flagChip, { backgroundColor: '#FFF7ED' }]}>
              <Text style={styles.flagText}>🌸 Parfüm</Text>
            </View>
          )}
          {ingredient.ingredient_group && (
            <View style={styles.flagChip}>
              <Text style={styles.flagText}>{ingredient.ingredient_group}</Text>
            </View>
          )}
          {ingredient.evidence_level && (
            <View style={[styles.flagChip, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.flagText, { color: colors.info }]}>
                {ingredient.evidence_level.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
        </View>

        {/* Function */}
        {ingredient.function_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ne İşe Yarar?</Text>
            <Text style={styles.bodyText}>{ingredient.function_summary}</Text>
          </View>
        )}

        {/* Detailed description */}
        {ingredient.detailed_description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detaylı Bilgi</Text>
            <Text style={styles.bodyText}>{ingredient.detailed_description}</Text>
          </View>
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textMuted, fontSize: fontSize.md },
  content: { padding: spacing.md },
  inciName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  commonName: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 },
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  flagChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  flagText: { fontSize: fontSize.xs, color: colors.textSecondary },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm,
  },
  bodyText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
});
