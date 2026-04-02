import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ingredient } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface Props {
  ingredient: Ingredient;
  onPress: () => void;
}

export default function IngredientCard({ ingredient, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {ingredient.inci_name}
        </Text>
        <View style={styles.flags}>
          {ingredient.allergen_flag && <Text style={styles.flag}>⚠️</Text>}
          {ingredient.fragrance_flag && <Text style={styles.flag}>🌸</Text>}
        </View>
      </View>
      {ingredient.common_name && (
        <Text style={styles.commonName}>{ingredient.common_name}</Text>
      )}
      {ingredient.function_summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {ingredient.function_summary}
        </Text>
      )}
      <View style={styles.footer}>
        {ingredient.ingredient_group && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{ingredient.ingredient_group}</Text>
          </View>
        )}
        {ingredient.evidence_level && (
          <EvidenceBadge level={ingredient.evidence_level} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function EvidenceBadge({ level }: { level: string }) {
  const label = level.replace(/_/g, ' ');
  return (
    <View style={styles.evidenceBadge}>
      <Text style={styles.evidenceText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  flags: {
    flexDirection: 'row',
    gap: 4,
  },
  flag: {
    fontSize: 14,
  },
  commonName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  evidenceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  evidenceText: {
    fontSize: fontSize.xs,
    color: colors.info,
    textTransform: 'capitalize',
  },
});
