import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

type TimeOfDay = 'morning' | 'evening';

const ROUTINE_STEPS: Record<TimeOfDay, { order: number; label: string; icon: string }[]> = {
  morning: [
    { order: 1, label: 'Temizleyici', icon: '🧴' },
    { order: 2, label: 'Tonik', icon: '💧' },
    { order: 3, label: 'Serum', icon: '✨' },
    { order: 4, label: 'Nemlendirici', icon: '🧊' },
    { order: 5, label: 'Güneş Kremi', icon: '☀️' },
  ],
  evening: [
    { order: 1, label: 'Temizleyici (1. adım)', icon: '🧴' },
    { order: 2, label: 'Temizleyici (2. adım)', icon: '🫧' },
    { order: 3, label: 'Aktif (Retinol/AHA/BHA)', icon: '⚡' },
    { order: 4, label: 'Nemlendirici', icon: '🧊' },
    { order: 5, label: 'Göz Kremi', icon: '👁️' },
  ],
};

export default function RoutineScreen() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  const steps = ROUTINE_STEPS[timeOfDay];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, timeOfDay === 'morning' && styles.toggleActive]}
          onPress={() => setTimeOfDay('morning')}
        >
          <Text
            style={[
              styles.toggleText,
              timeOfDay === 'morning' && styles.toggleTextActive,
            ]}
          >
            ☀️ Sabah
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, timeOfDay === 'evening' && styles.toggleActive]}
          onPress={() => setTimeOfDay('evening')}
        >
          <Text
            style={[
              styles.toggleText,
              timeOfDay === 'evening' && styles.toggleTextActive,
            ]}
          >
            🌙 Akşam
          </Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      {steps.map((step, idx) => (
        <View key={step.order} style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.order}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <TouchableOpacity style={styles.addProduct}>
                <Text style={styles.addProductText}>+ Ürün Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
          {idx < steps.length - 1 && <View style={styles.connector} />}
        </View>
      ))}

      {/* Interaction Warnings */}
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Bilinen Etkileşimler</Text>
        <Text style={styles.warningText}>
          Retinol + AHA/BHA → aynı akşam birlikte kullanma
        </Text>
        <Text style={styles.warningText}>
          Vitamin C + Niacinamide → farklı adımlarda uygula
        </Text>
      </View>

      <Text style={styles.note}>
        M7 sprint'inde tam fonksiyonel rutin oluşturucu eklenecek
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: fontSize.md, fontWeight: '500', color: colors.textSecondary },
  toggleTextActive: { color: colors.white },
  stepCard: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumberText: { color: colors.white, fontWeight: '700', fontSize: fontSize.xs },
  stepContent: {
    marginLeft: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  stepIcon: { fontSize: 28 },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  addProduct: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  addProductText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  connector: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -spacing.sm,
    width: 2,
    backgroundColor: colors.primary + '30',
  },
  warningBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  warningTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  note: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});
