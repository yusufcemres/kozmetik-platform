import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { SkinType } from 'shared';
import { useSkinProfile } from '@/hooks/useSkinProfile';
import { getNeeds, Need } from '@/services/api';

const SKIN_TYPES: { value: SkinType; label: string; icon: string; description: string }[] = [
  { value: SkinType.OILY, label: 'Yağlı', icon: '💧', description: 'Parlama, geniş gözenekler' },
  { value: SkinType.DRY, label: 'Kuru', icon: '🏜️', description: 'Sıkılık, pullanma' },
  { value: SkinType.COMBINATION, label: 'Karma', icon: '☯️', description: 'T-bölge yağlı, yanaklar kuru' },
  { value: SkinType.NORMAL, label: 'Normal', icon: '✨', description: 'Dengeli, az sorun' },
  { value: SkinType.SENSITIVE, label: 'Hassas', icon: '🌸', description: 'Kızarıklık, tahriş' },
];

const SENSITIVITIES = [
  { key: 'fragrance', label: 'Parfüm / Koku', icon: '🌸' },
  { key: 'alcohol', label: 'Alkol', icon: '🧴' },
  { key: 'paraben', label: 'Paraben', icon: '⚗️' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar', icon: '🫒' },
];

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function ProfileScreen() {
  const { profile, loading: profileLoading, saveProfile } = useSkinProfile();
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [sensitivities, setSensitivities] = useState<Record<string, boolean>>({
    fragrance: false,
    alcohol: false,
    paraben: false,
    essential_oils: false,
  });
  const [concerns, setConcerns] = useState<number[]>([]);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing profile
  useEffect(() => {
    if (profile) {
      setSkinType(profile.skin_type as SkinType);
      setSensitivities(profile.sensitivities);
      setConcerns(profile.concerns || []);
      setAgeRange(profile.age_range || null);
      setSaved(true);
    }
  }, [profile]);

  // Load needs for concern selection
  useEffect(() => {
    getNeeds()
      .then((r) => setNeeds(r.data.data || []))
      .catch(() => {});
  }, []);

  const toggleSensitivity = (key: string) => {
    setSensitivities((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const toggleConcern = (needId: number) => {
    setConcerns((prev) =>
      prev.includes(needId)
        ? prev.filter((id) => id !== needId)
        : [...prev, needId],
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!skinType) {
      Alert.alert('Eksik Bilgi', 'Lütfen cilt tipini seç');
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        skin_type: skinType,
        concerns,
        sensitivities: sensitivities as {
          fragrance: boolean;
          alcohol: boolean;
          paraben: boolean;
          essential_oils: boolean;
        },
        age_range: ageRange || undefined,
      });
      setSaved(true);
    } catch {
      Alert.alert('Hata', 'Profil kaydedilirken bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cilt Profilim</Text>
      <Text style={styles.subtitle}>
        Profilini oluşturarak sana özel uyumluluk skorları al
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
            onPress={() => {
              setSkinType(type.value);
              setSaved(false);
            }}
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
            <Text style={styles.skinTypeDesc}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 2: Concerns */}
      {needs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>2. Cilt Kaygıların</Text>
          <View style={styles.concernsRow}>
            {needs.map((need) => (
              <TouchableOpacity
                key={need.need_id}
                style={[
                  styles.concernChip,
                  concerns.includes(need.need_id) && styles.concernChipActive,
                ]}
                onPress={() => toggleConcern(need.need_id)}
              >
                {need.icon && (
                  <Text style={styles.concernIcon}>{need.icon}</Text>
                )}
                <Text
                  style={[
                    styles.concernText,
                    concerns.includes(need.need_id) && styles.concernTextActive,
                  ]}
                >
                  {need.need_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Step 3: Sensitivities */}
      <Text style={styles.sectionTitle}>
        {needs.length > 0 ? '3' : '2'}. Hassasiyetlerin
      </Text>
      {SENSITIVITIES.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={styles.sensitivityRow}
          onPress={() => toggleSensitivity(s.key)}
        >
          <Text style={styles.sensitivityIcon}>{s.icon}</Text>
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

      {/* Step 4: Age Range */}
      <Text style={styles.sectionTitle}>
        {needs.length > 0 ? '4' : '3'}. Yaş Aralığın (Opsiyonel)
      </Text>
      <View style={styles.ageRow}>
        {AGE_RANGES.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.ageChip,
              ageRange === range && styles.ageChipActive,
            ]}
            onPress={() => {
              setAgeRange(ageRange === range ? null : range);
              setSaved(false);
            }}
          >
            <Text
              style={[
                styles.ageText,
                ageRange === range && styles.ageTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          saved && styles.saveButtonSaved,
          saving && styles.saveButtonSaving,
        ]}
        onPress={handleSave}
        disabled={saved || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>
            {saved ? '✓ Kaydedildi' : 'Profili Kaydet'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        Veriler cihazında saklanır ve anonim olarak backend'e senkronize edilir.
        Hesap oluşturmana gerek yok.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
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
    width: '47%',
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
  skinTypeLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  skinTypeLabelActive: { color: colors.primary },
  skinTypeDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  concernsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  concernChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  concernIcon: { fontSize: 14 },
  concernText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  concernTextActive: { color: colors.primary },
  sensitivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sensitivityIcon: { fontSize: 16, marginRight: spacing.sm },
  sensitivityLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
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
  ageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ageChip: {
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ageChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  ageText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ageTextActive: { color: colors.primary },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonSaved: { backgroundColor: colors.success },
  saveButtonSaving: { opacity: 0.7 },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  note: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
