import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface RoutineStep {
  order: number;
  type: string;
  label: string;
  product_name?: string;
  icon: string;
}

const morningTemplate: RoutineStep[] = [
  { order: 1, type: 'cleanser', label: 'Temizleyici', icon: '🧴' },
  { order: 2, type: 'toner', label: 'Tonik', icon: '💧' },
  { order: 3, type: 'serum', label: 'Serum', icon: '✨' },
  { order: 4, type: 'moisturizer', label: 'Nemlendirici', icon: '🧊' },
  { order: 5, type: 'sunscreen', label: 'Güneş Kremi', icon: '☀️' },
];

const eveningTemplate: RoutineStep[] = [
  { order: 1, type: 'cleanser', label: 'Temizleyici', icon: '🧴' },
  { order: 2, type: 'active', label: 'Aktif Bakım', icon: '⚗️' },
  { order: 3, type: 'moisturizer', label: 'Nemlendirici', icon: '🧊' },
  { order: 4, type: 'eye_cream', label: 'Göz Kremi', icon: '👁️' },
];

const interactions = [
  { type: 'conflict' as const, message: 'Retinol + AHA/BHA aynı akşam kullanma', icon: '⚠️' },
  { type: 'order' as const, message: 'Vitamin C sabah, Retinol akşam kullan', icon: '📋' },
  { type: 'synergy' as const, message: 'Ceramide + Hyaluronic Acid birlikte iyi çalışır', icon: '✅' },
];

export default function RoutineScreen() {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const steps = activeTab === 'morning' ? morningTemplate : eveningTemplate;

  return (
    <ScrollView style={styles.container}>
      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'morning' && styles.tabActive]}
          onPress={() => setActiveTab('morning')}
        >
          <Text style={[styles.tabText, activeTab === 'morning' && styles.tabTextActive]}>
            ☀️ Sabah
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'evening' && styles.tabActive]}
          onPress={() => setActiveTab('evening')}
        >
          <Text style={[styles.tabText, activeTab === 'evening' && styles.tabTextActive]}>
            🌙 Akşam
          </Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      {steps.map((step, index) => (
        <View key={step.order} style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.order}</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
            {step.product_name ? (
              <Text style={styles.productName}>{step.product_name}</Text>
            ) : (
              <TouchableOpacity style={styles.addProduct}>
                <Text style={styles.addProductText}>+ Ürün Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
          {index < steps.length - 1 && <View style={styles.stepLine} />}
        </View>
      ))}

      {/* Interactions */}
      <Text style={styles.sectionTitle}>Ingredient Etkileşimleri</Text>
      {interactions.map((item, i) => (
        <View key={i} style={[
          styles.interactionCard,
          item.type === 'conflict' && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
          item.type === 'synergy' && { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
          item.type === 'order' && { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
        ]}>
          <Text style={styles.interactionIcon}>{item.icon}</Text>
          <Text style={styles.interactionText}>{item.message}</Text>
        </View>
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: 4, marginBottom: spacing.lg,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, position: 'relative',
  },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  stepNumberText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  stepContent: { flex: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepIcon: { fontSize: 20 },
  stepLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  productName: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  addProduct: {
    marginTop: 4, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: borderRadius.sm, padding: spacing.xs, alignItems: 'center',
  },
  addProductText: { fontSize: fontSize.xs, color: colors.primary },
  stepLine: {
    position: 'absolute', left: 15, top: 36, width: 2, height: 28,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: '700', color: colors.text,
    marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  interactionCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, marginBottom: spacing.sm, gap: spacing.sm,
  },
  interactionIcon: { fontSize: 20 },
  interactionText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
});
