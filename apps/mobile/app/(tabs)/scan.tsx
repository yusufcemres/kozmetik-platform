import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { search, SearchResult } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

type ScanMode = 'home' | 'barcode_manual' | 'inci_manual';

export default function ScanScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>('home');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleBarcodeSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await search(input.trim(), 'product');
      const items = res.data.results || [];
      setResults(items);
      if (items.length === 1) {
        router.push(`/product/${items[0].slug}` as any);
      } else if (items.length === 0) {
        Alert.alert('Bulunamadı', 'Bu barkod/isimle eşleşen ürün bulunamadı');
      }
    } catch {
      Alert.alert('Hata', 'Arama yapılırken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInciAnalysis = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Parse INCI list: comma-separated ingredients
      const ingredients = input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (ingredients.length === 0) {
        Alert.alert('Hata', 'Geçerli bir INCI listesi girin');
        return;
      }

      // Search each ingredient to find matches
      const found: SearchResult[] = [];
      for (const ing of ingredients.slice(0, 10)) {
        try {
          const res = await search(ing, 'ingredient');
          const items = res.data.results || [];
          if (items.length > 0) found.push(items[0]);
        } catch {}
      }

      setResults(found);
      if (found.length === 0) {
        Alert.alert(
          'Sonuç Yok',
          'Girdiğiniz içerikler veritabanımızda bulunamadı',
        );
      }
    } catch {
      Alert.alert('Hata', 'Analiz yapılırken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'home') {
    return (
      <View style={styles.container}>
        {/* Camera Placeholder */}
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraTitle}>Barkod Tarama</Text>
          <Text style={styles.cameraSubtitle}>
            Kamera entegrasyonu yakında aktif olacak.{'\n'}
            Şimdilik manuel giriş yapabilirsiniz.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setMode('barcode_manual')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionText}>Ürün Ara</Text>
              <Text style={styles.actionDesc}>
                Barkod veya ürün adıyla ara
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionSecondary]}
            onPress={() => setMode('inci_manual')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionText}>INCI Analizi</Text>
              <Text style={styles.actionDesc}>
                İçerik listesini yapıştır, analiz et
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Manual entry modes
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.manualHeader}>
        <TouchableOpacity onPress={() => { setMode('home'); setInput(''); setResults([]); }}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.manualTitle}>
          {mode === 'barcode_manual' ? 'Ürün Ara' : 'INCI Analizi'}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          mode === 'inci_manual' && styles.inputMultiline,
        ]}
        placeholder={
          mode === 'barcode_manual'
            ? 'Barkod numarası veya ürün adı...'
            : 'INCI listesini yapıştırın (virgülle ayırın)...'
        }
        placeholderTextColor={colors.textMuted}
        value={input}
        onChangeText={setInput}
        multiline={mode === 'inci_manual'}
        autoFocus
        returnKeyType={mode === 'barcode_manual' ? 'search' : 'default'}
        onSubmitEditing={
          mode === 'barcode_manual' ? handleBarcodeSearch : undefined
        }
      />

      <TouchableOpacity
        style={[styles.analyzeButton, !input.trim() && styles.analyzeButtonDisabled]}
        onPress={
          mode === 'barcode_manual' ? handleBarcodeSearch : handleInciAnalysis
        }
        disabled={!input.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.analyzeButtonText}>
            {mode === 'barcode_manual' ? '🔍 Ara' : '🧪 Analiz Et'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Results */}
      {results.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            {results.length} sonuç bulundu
          </Text>
          {results.map((item, i) => (
            <TouchableOpacity
              key={`${item.type}-${item.id}-${i}`}
              style={styles.resultCard}
              onPress={() => {
                const route =
                  item.type === 'product'
                    ? `/product/${item.slug}`
                    : `/ingredient/${item.slug}`;
                router.push(route as any);
              }}
            >
              <Text style={styles.resultTypeIcon}>
                {item.type === 'product' ? '📦' : '🧪'}
              </Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.detail && (
                  <Text style={styles.resultDetail} numberOfLines={1}>
                    {item.detail}
                  </Text>
                )}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {mode === 'inci_manual' && (
        <View style={styles.inciHelp}>
          <Text style={styles.inciHelpTitle}>Nasıl Kullanılır?</Text>
          <Text style={styles.inciHelpText}>
            1. Ürünün arkasındaki içerik listesini kopyalayın{'\n'}
            2. Yukarıdaki alana yapıştırın{'\n'}
            3. "Analiz Et" butonuna tıklayın{'\n'}
            4. Her bir içeriğin detaylarını inceleyin
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  scrollContent: { paddingBottom: spacing.xxl },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: colors.text + '08',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  cameraIcon: { fontSize: 64, marginBottom: spacing.md },
  cameraTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cameraSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
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
  actionTextWrap: { flex: 1 },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  actionDesc: {
    fontSize: fontSize.xs,
    color: colors.white + 'CC',
    marginTop: 2,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  manualTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  analyzeButtonDisabled: { opacity: 0.5 },
  analyzeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  resultsSection: { marginTop: spacing.sm },
  resultsTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTypeIcon: { fontSize: 20, marginRight: spacing.sm },
  resultInfo: { flex: 1 },
  resultName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  resultDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: { fontSize: 20, color: colors.textMuted },
  inciHelp: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  inciHelpTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inciHelpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
