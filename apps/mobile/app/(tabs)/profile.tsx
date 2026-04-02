import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { SkinType } from 'shared';

const SKIN_TYPES: { value: SkinType; label: string; icon: string }[] = [
  { value: SkinType.OILY, label: 'Yağlı', icon: '💧' },
  { value: SkinType.DRY, label: 'Kuru', icon: '🏜️' },
  { value: SkinType.COMBINATION, label: 'Karma', icon: '☯️' },
  { value: SkinType.NORMAL, label: 'Normal', icon: '✨' },
  { value: SkinType.SENSITIVE, label: 'Hassas', icon: '🌸' },
];

const SENSITIVITIES = [
  { key: 'fragrance', label: 'Parfüm / Koku' },
  { key: 'alcohol', label: 'Alkol' },
  { key: 'paraben', label: 'Paraben' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar' },
];

export default function ProfileScreen() {
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [sensitivities, setSensitivities] = useState<Record<string, boolean>>({
    fragrance: false,
    alcohol: false,
    paraben: false,
    essential_oils: false,
  });
  const [saved, setSaved] = useState(false);

  const toggleSensitivity = (key: string) => {
    setSensitivities((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    // M3'te AsyncStorage + backend sync eklenecek
    setSaved(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cilt Profilim</Text>
      <Text style={styles.subtitle}>
        Profilini oluşturarak sana özel ürün önerileri al
      </Text>

      {/* Step 1: Skin Type */}
      <Text style={styles.sectionTitle}>1. Cilt Tipin</Text>
      <View style={styles.skinTypeRow}>
        {SKIN_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.skinTypeCard,
              skinType === type.value && styles.skinTypeCardActive,
            ]}
            onPress={() => { setSkinType(type.value); setSaved(false); }}
          >
            <Text style={styles.skinTypeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.skinTypeLabel,
                skinType === type.value && styles.skinTypeLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 2: Sensitivities */}
      <Text style={styles.sectionTitle}>2. Hassasiyetlerin</Text>
      {SENSITIVITIES.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={styles.sensitivityRow}
          onPress={() => toggleSensitivity(s.key)}
        >
          <Text style={styles.sensitivityLabel}>{s.label}</Text>
          <View
            style={[
              styles.toggle,
              sensitivities[s.key] && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>
              {sensitivities[s.key] ? '✓' : ''}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, saved && styles.saveButtonSaved]}
        onPress={handleSave}
        disabled={saved}
      >
        <Text style={styles.saveButtonText}>
          {saved ? '✓ Kaydedildi' : 'Profili Kaydet'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Veriler cihazında saklanır. Hesap oluşturmana gerek yok.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  skinTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skinTypeCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  skinTypeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  skinTypeIcon: { fontSize: 28, marginBottom: spacing.xs },
  skinTypeLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  skinTypeLabelActive: { color: colors.primary },
  sensitivityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sensitivityLabel: { fontSize: fontSize.md, color: colors.text },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonSaved: { backgroundColor: colors.success },
  saveButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  note: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
});
