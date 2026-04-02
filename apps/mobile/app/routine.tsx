import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getFavorites, FavoriteItem } from '@/stores/favorites';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

type TimeOfDay = 'morning' | 'evening';

interface RoutineStep {
  order: number;
  label: string;
  icon: string;
  product?: FavoriteItem;
}

const MORNING_STEPS = [
  { order: 1, label: 'Temizleyici', icon: '🧴' },
  { order: 2, label: 'Tonik', icon: '💧' },
  { order: 3, label: 'Serum', icon: '✨' },
  { order: 4, label: 'Nemlendirici', icon: '🧊' },
  { order: 5, label: 'Güneş Kremi', icon: '☀️' },
];

const EVENING_STEPS = [
  { order: 1, label: 'Temizleyici (1. adım)', icon: '🧴' },
  { order: 2, label: 'Temizleyici (2. adım)', icon: '🫧' },
  { order: 3, label: 'Aktif (Retinol/AHA/BHA)', icon: '⚡' },
  { order: 4, label: 'Nemlendirici', icon: '🧊' },
  { order: 5, label: 'Göz Kremi', icon: '👁️' },
];

export default function RoutineScreen() {
  const router = useRouter();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [morningSteps, setMorningSteps] = useState<RoutineStep[]>(
    MORNING_STEPS.map((s) => ({ ...s })),
  );
  const [eveningSteps, setEveningSteps] = useState<RoutineStep[]>(
    EVENING_STEPS.map((s) => ({ ...s })),
  );
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectingStep, setSelectingStep] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, []),
  );

  const steps = timeOfDay === 'morning' ? morningSteps : eveningSteps;
  const setSteps = timeOfDay === 'morning' ? setMorningSteps : setEveningSteps;

  const assignProduct = (stepOrder: number, fav: FavoriteItem) => {
    setSteps((prev) =>
      prev.map((s) => (s.order === stepOrder ? { ...s, product: fav } : s)),
    );
    setSelectingStep(null);
  };

  const clearProduct = (stepOrder: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.order === stepOrder ? { ...s, product: undefined } : s)),
    );
  };

  // Check for known ingredient interactions
  const hasRetinol = steps.some(
    (s) =>
      s.product?.product_name.toLowerCase().includes('retinol') ||
      s.label.includes('Retinol'),
  );
  const hasAha = steps.some(
    (s) =>
      s.product?.product_name.toLowerCase().includes('aha') ||
      s.product?.product_name.toLowerCase().includes('bha'),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            timeOfDay === 'morning' && styles.toggleActive,
          ]}
          onPress={() => { setTimeOfDay('morning'); setSelectingStep(null); }}
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
          style={[
            styles.toggleButton,
            timeOfDay === 'evening' && styles.toggleActive,
          ]}
          onPress={() => { setTimeOfDay('evening'); setSelectingStep(null); }}
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
        <View key={step.order}>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.order}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                {step.product ? (
                  <View style={styles.assignedProduct}>
                    <TouchableOpacity
                      style={styles.productRow}
                      onPress={() =>
                        router.push(
                          `/product/${step.product!.product_slug}` as any,
                        )
                      }
                    >
                      {step.product.image_url ? (
                        <Image
                          source={{ uri: step.product.image_url }}
                          style={styles.productThumb}
                        />
                      ) : null}
                      <Text style={styles.productName} numberOfLines={1}>
                        {step.product.product_name}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => clearProduct(step.order)}
                    >
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addProduct}
                    onPress={() =>
                      setSelectingStep(
                        selectingStep === step.order ? null : step.order,
                      )
                    }
                  >
                    <Text style={styles.addProductText}>+ Ürün Ekle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Product selector dropdown */}
          {selectingStep === step.order && (
            <View style={styles.productSelector}>
              {favorites.length > 0 ? (
                <>
                  <Text style={styles.selectorTitle}>
                    Favorilerinden seç:
                  </Text>
                  {favorites.map((fav) => (
                    <TouchableOpacity
                      key={fav.product_id}
                      style={styles.selectorItem}
                      onPress={() => assignProduct(step.order, fav)}
                    >
                      {fav.image_url ? (
                        <Image
                          source={{ uri: fav.image_url }}
                          style={styles.selectorThumb}
                        />
                      ) : (
                        <Text style={styles.selectorIcon}>📦</Text>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectorName} numberOfLines={1}>
                          {fav.product_name}
                        </Text>
                        {fav.brand_name && (
                          <Text style={styles.selectorBrand}>
                            {fav.brand_name}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.emptySelector}>
                  <Text style={styles.emptySelectorText}>
                    Henüz favorilerin yok.{'\n'}Ürünleri favorilere ekleyerek
                    rutinine atayabilirsin.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/search')}
                  >
                    <Text style={styles.browseFavLink}>Ürünleri Keşfet →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {idx < steps.length - 1 && <View style={styles.connector} />}
        </View>
      ))}

      {/* Interaction Warnings */}
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Bilinen Etkileşimler</Text>
        {hasRetinol && hasAha && (
          <View style={styles.warningAlert}>
            <Text style={styles.warningAlertText}>
              Retinol ve AHA/BHA aynı rutinde! Tahriş riski yüksek.
            </Text>
          </View>
        )}
        <Text style={styles.warningText}>
          Retinol + AHA/BHA → aynı akşam birlikte kullanma
        </Text>
        <Text style={styles.warningText}>
          Vitamin C + Niacinamide → farklı adımlarda uygula
        </Text>
        <Text style={styles.warningText}>
          Benzoyl Peroxide + Retinol → birlikte inaktif olurlar
        </Text>
      </View>
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
  toggleText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  toggleTextActive: { color: colors.white },
  stepCard: {
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
  stepNumberText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
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
  stepLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  addProduct: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  addProductText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  assignedProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  productRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  productThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  productName: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  removeText: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 4,
  },
  productSelector: {
    marginLeft: 38,
    marginTop: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  selectorTitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  selectorThumb: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  selectorIcon: { fontSize: 20 },
  selectorName: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  selectorBrand: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptySelector: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  emptySelectorText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  browseFavLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  connector: {
    marginLeft: 13,
    width: 2,
    height: spacing.sm,
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
  warningAlert: {
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningAlertText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '600',
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
