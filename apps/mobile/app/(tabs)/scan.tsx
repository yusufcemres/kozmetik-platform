import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>Barkod Tarama</Text>
        <Text style={styles.subtitle}>
          Ürün barkodunu veya INCI etiketini tarayarak analiz et
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Barkod Tara</Text>
          <Text style={styles.actionDesc}>
            Ürünü veritabanında ara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.actionSecondary]}>
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>INCI Etiketi Tara</Text>
          <Text style={styles.actionDesc}>
            İçerik listesini OCR ile analiz et
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        M4-M5 sprint'lerinde kamera entegrasyonu eklenecek
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: colors.text + '10',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  icon: { fontSize: 64, marginBottom: spacing.md },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  actions: { gap: spacing.sm, marginBottom: spacing.md },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionSecondary: { backgroundColor: colors.primaryDark },
  actionIcon: { fontSize: 24 },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  actionDesc: { fontSize: fontSize.xs, color: colors.white + 'CC' },
  note: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
