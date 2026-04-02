import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

export default function CompareScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>⚖️</Text>
        <Text style={styles.title}>Ürün Karşılaştırma</Text>
        <Text style={styles.subtitle}>
          2-3 ürünü yan yana karşılaştır: ortak/farklı ingredient'ler,
          need skorları ve kişisel uyum
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🧪</Text>
            <Text style={styles.featureText}>Ingredient diff (ortak / farklı)</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Need skor karşılaştırması</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👤</Text>
            <Text style={styles.featureText}>Kişisel uyum karşılaştırması</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Fiyat karşılaştırması</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Bu özellik M8 sprint'inde tam olarak aktifleştirilecek.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  placeholder: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginTop: spacing.lg,
  },
  icon: { fontSize: 64, marginBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  subtitle: {
    fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: 22,
  },
  featureList: { marginTop: spacing.xl, alignSelf: 'stretch' },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  featureIcon: { fontSize: 20 },
  featureText: { fontSize: fontSize.sm, color: colors.text },
  note: {
    fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.lg, fontStyle: 'italic',
  },
});
