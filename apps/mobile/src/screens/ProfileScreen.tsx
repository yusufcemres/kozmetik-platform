import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/AppNavigator';
import { useSkinProfile } from '../hooks/useSkinProfile';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const skinTypes = [
  { value: 'oily', label: 'Yağlı', icon: '💧' },
  { value: 'dry', label: 'Kuru', icon: '🏜️' },
  { value: 'combination', label: 'Karma', icon: '🔄' },
  { value: 'normal', label: 'Normal', icon: '✨' },
  { value: 'sensitive', label: 'Hassas', icon: '🌸' },
];

const concernOptions = [
  { id: 1, label: 'Sivilce / Akne' },
  { id: 2, label: 'Leke / Hiperpigmentasyon' },
  { id: 3, label: 'Kırışıklık / Yaşlanma' },
  { id: 4, label: 'Kuruluk / Dehidrasyon' },
  { id: 5, label: 'Gözenek' },
  { id: 6, label: 'Hassasiyet / Kızarıklık' },
  { id: 7, label: 'Cilt Bariyeri' },
  { id: 8, label: 'Mat / Cansız Cilt' },
  { id: 9, label: 'Güneş Koruması' },
  { id: 10, label: 'Siyah Nokta' },
  { id: 11, label: 'Göz Altı' },
  { id: 12, label: 'Elastikiyet' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, loading, saveProfile } = useSkinProfile();

  const [step, setStep] = useState(profile ? -1 : 0); // -1 = view mode
  const [skinType, setSkinType] = useState(profile?.skin_type || '');
  const [concerns, setConcerns] = useState<number[]>(profile?.concerns || []);
  const [sensitivities, setSensitivities] = useState(
    profile?.sensitivities || {
      fragrance: false,
      alcohol: false,
      paraben: false,
      essential_oils: false,
    },
  );

  const toggleConcern = (id: number) => {
    setConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const toggleSensitivity = (key: keyof typeof sensitivities) => {
    setSensitivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!skinType) return Alert.alert('Hata', 'Cilt tipi seçin');
    if (concerns.length === 0) return Alert.alert('Hata', 'En az 1 ihtiyaç seçin');

    await saveProfile({ skin_type: skinType, concerns, sensitivities });
    setStep(-1);
    Alert.alert('Kaydedildi', 'Profilin güncellendi!');
  };

  // View mode — show profile summary
  if (step === -1 && profile) {
    const skinLabel = skinTypes.find((s) => s.value === profile.skin_type);

    return (
      <ScrollView style={styles.container}>
        <View style={styles.profileCard}>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>{skinLabel?.icon || '👤'}</Text>
          <Text style={styles.profileTitle}>
            {skinLabel?.label || profile.skin_type} Cilt
          </Text>

          <Text style={styles.profileSubtitle}>İhtiyaçlar</Text>
          <View style={styles.chipRow}>
            {profile.concerns.map((id) => {
              const c = concernOptions.find((o) => o.id === id);
              return (
                <View key={id} style={styles.chip}>
                  <Text style={styles.chipText}>{c?.label || `#${id}`}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.profileSubtitle}>Hassasiyetler</Text>
          <View style={styles.chipRow}>
            {profile.sensitivities.fragrance && <View style={styles.chipWarn}><Text style={styles.chipWarnText}>Parfüm</Text></View>}
            {profile.sensitivities.alcohol && <View style={styles.chipWarn}><Text style={styles.chipWarnText}>Alkol</Text></View>}
            {profile.sensitivities.paraben && <View style={styles.chipWarn}><Text style={styles.chipWarnText}>Paraben</Text></View>}
            {profile.sensitivities.essential_oils && <View style={styles.chipWarn}><Text style={styles.chipWarnText}>Esansiyel Yağ</Text></View>}
            {!Object.values(profile.sensitivities).some(Boolean) && (
              <Text style={styles.noSensitivity}>Hassasiyet yok</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => setStep(0)}>
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>

        {/* Quick links */}
        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.linkIcon}>❤️</Text>
            <Text style={styles.linkLabel}>Favorilerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('Routine')}>
            <Text style={styles.linkIcon}>🧴</Text>
            <Text style={styles.linkLabel}>Rutinim</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    );
  }

  // Wizard mode
  return (
    <ScrollView style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[0, 1, 2].map((s) => (
          <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View>
          <Text style={styles.wizardTitle}>Cilt Tipin Ne?</Text>
          <View style={styles.optionsGrid}>
            {skinTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.optionCard, skinType === type.value && styles.optionCardActive]}
                onPress={() => setSkinType(type.value)}
              >
                <Text style={{ fontSize: 32 }}>{type.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  skinType === type.value && styles.optionLabelActive,
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.nextButton, !skinType && styles.nextButtonDisabled]}
            onPress={() => skinType && setStep(1)}
          >
            <Text style={styles.nextButtonText}>Devam</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.wizardTitle}>En Önemli İhtiyaçların (max 3)</Text>
          <View style={styles.optionsGrid}>
            {concernOptions.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.concernChip, concerns.includes(c.id) && styles.concernChipActive]}
                onPress={() => toggleConcern(c.id)}
              >
                <Text style={[
                  styles.concernChipText,
                  concerns.includes(c.id) && styles.concernChipTextActive,
                ]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(0)}>
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, concerns.length === 0 && styles.nextButtonDisabled]}
              onPress={() => concerns.length > 0 && setStep(2)}
            >
              <Text style={styles.nextButtonText}>Devam</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.wizardTitle}>Hassasiyetin Var Mı?</Text>
          {[
            { key: 'fragrance' as const, label: 'Parfüm / Koku' },
            { key: 'alcohol' as const, label: 'Alkol (Alcohol Denat.)' },
            { key: 'paraben' as const, label: 'Paraben' },
            { key: 'essential_oils' as const, label: 'Esansiyel Yağlar' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.sensitivityRow, sensitivities[item.key] && styles.sensitivityRowActive]}
              onPress={() => toggleSensitivity(item.key)}
            >
              <Text style={styles.sensitivityLabel}>{item.label}</Text>
              <Text style={{ fontSize: 20 }}>{sensitivities[item.key] ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.lg },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary },
  wizardTitle: {
    fontSize: fontSize.xl, fontWeight: '700', color: colors.text,
    textAlign: 'center', marginBottom: spacing.lg,
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  optionCard: {
    width: '45%', backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center',
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: '#F0FDFA' },
  optionLabel: { fontSize: fontSize.md, color: colors.text, marginTop: spacing.xs, fontWeight: '500' },
  optionLabelActive: { color: colors.primary, fontWeight: '700' },
  concernChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  concernChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  concernChipText: { fontSize: fontSize.sm, color: colors.text },
  concernChipTextActive: { color: colors.white, fontWeight: '600' },
  sensitivityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  sensitivityRowActive: { borderColor: colors.warning, backgroundColor: '#FFFBEB' },
  sensitivityLabel: { fontSize: fontSize.md, color: colors.text },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  nextButton: {
    flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: { color: colors.white, fontWeight: '700', fontSize: fontSize.md },
  backButton: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  backButtonText: { color: colors.textSecondary, fontWeight: '600', fontSize: fontSize.md },
  saveButton: {
    flex: 1, backgroundColor: colors.success, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  saveButtonText: { color: colors.white, fontWeight: '700', fontSize: fontSize.md },
  // Profile view
  profileCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center',
  },
  profileTitle: {
    fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.sm,
  },
  profileSubtitle: {
    fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary,
    marginTop: spacing.lg, alignSelf: 'flex-start',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    backgroundColor: '#ECFDF5', paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  chipText: { fontSize: fontSize.xs, color: colors.primaryDark },
  chipWarn: {
    backgroundColor: '#FFFBEB', paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  chipWarnText: { fontSize: fontSize.xs, color: '#D97706' },
  noSensitivity: { fontSize: fontSize.xs, color: colors.textMuted },
  editButton: {
    borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md,
  },
  editButtonText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm },
  linksSection: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  linkCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  linkIcon: { fontSize: 28 },
  linkLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500', marginTop: 4 },
});
