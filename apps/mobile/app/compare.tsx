import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.slotsRow}>
        <TouchableOpacity style={styles.slot}>
          <Text style={styles.slotIcon}>+</Text>
          <Text style={styles.slotText}>Ürün 1 Seç</Text>
        </TouchableOpacity>

        <Text style={styles.vsText}>VS</Text>

        <TouchableOpacity style={styles.slot}>
          <Text style={styles.slotIcon}>+</Text>
          <Text style={styles.slotText}>Ürün 2 Seç</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>⚖️</Text>
        <Text style={styles.infoTitle}>Ürün Karşılaştırma</Text>
        <Text style={styles.infoText}>
          İki ürünü yan yana karşılaştırarak ortak ve farklı içeriklerini,
          ihtiyaç skorlarını ve kişisel uyumlarını incele.
        </Text>
        <Text style={styles.note}>M8 sprint'inde tam fonksiyonel olacak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  slot: {
    flex: 1,
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotIcon: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  slotText: { fontSize: fontSize.sm, color: colors.textSecondary },
  vsText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textMuted,
  },
  infoBox: {
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoIcon: { fontSize: 48, marginBottom: spacing.sm },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
