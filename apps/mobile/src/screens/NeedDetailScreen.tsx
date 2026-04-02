import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { getNeedBySlug, Need } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Route = RouteProp<HomeStackParamList, 'NeedDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList, 'NeedDetail'>;

export default function NeedDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [need, setNeed] = useState<Need | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNeedBySlug(route.params.slug)
      .then((r) => setNeed(r.data))
      .catch(() => setNeed(null))
      .finally(() => setLoading(false));
  }, [route.params.slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!need) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>İhtiyaç bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 48 }}>{need.icon || '🎯'}</Text>
        </View>

        <Text style={styles.name}>{need.need_name}</Text>
        {need.description && (
          <Text style={styles.description}>{need.description}</Text>
        )}

        {/* Etkili İçerikler placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bu İhtiyaç İçin Etkili İçerikler</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              En yüksek relevance skoruna sahip ingredient'ler
            </Text>
          </View>
        </View>

        {/* Uyumlu Ürünler placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uyumlu Ürünler</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Bu ihtiyaç için en yüksek uyum skorlu ürünler
            </Text>
          </View>
        </View>

        {/* Search CTA */}
        <TouchableOpacity
          style={styles.searchCta}
          onPress={() => navigation.navigate('Search', { query: need.need_name })}
        >
          <Text style={styles.ctaText}>
            "{need.need_name}" ile ilgili ürünleri ara
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textMuted, fontSize: fontSize.md },
  content: { padding: spacing.md },
  iconBox: { alignItems: 'center', marginVertical: spacing.md },
  name: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  description: {
    fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: 24,
  },
  section: { marginTop: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm,
  },
  placeholder: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg,
    alignItems: 'center',
  },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  searchCta: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, marginTop: spacing.xl, alignItems: 'center',
  },
  ctaText: { color: colors.white, fontWeight: '600', fontSize: fontSize.md },
});
