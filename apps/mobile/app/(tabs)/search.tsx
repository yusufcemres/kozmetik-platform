import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { search, searchSuggest, SearchResult } from '@/services/api';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

const typeIcon: Record<string, string> = {
  product: '📦',
  ingredient: '🧪',
  need: '🎯',
};

const typeLabel: Record<string, string> = {
  product: 'Ürün',
  ingredient: 'İçerik',
  need: 'İhtiyaç',
};

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await search(q);
      setResults(res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.q) doSearch(params.q);
  }, [params.q, doSearch]);

  const handleQueryChange = async (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      try {
        const res = await searchSuggest(text);
        setSuggestions(Array.isArray(res.data) ? res.data : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    } else {
      setShowSuggestions(false);
      if (text.length === 0) setResults([]);
    }
  };

  const navigateToResult = (item: SearchResult) => {
    setShowSuggestions(false);
    const routes: Record<string, string> = {
      product: `/product/${item.slug}`,
      ingredient: `/ingredient/${item.slug}`,
      need: `/need/${item.slug}`,
    };
    router.push(routes[item.type] as any);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Ürün, içerik veya ihtiyaç ara..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => doSearch(query)}
          returnKeyType="search"
          autoFocus
        />
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.slice(0, 6).map((s, i) => (
            <TouchableOpacity
              key={`${s.type}-${s.id}-${i}`}
              style={[
                styles.suggestionItem,
                i === suggestions.slice(0, 6).length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                setQuery(s.name);
                setShowSuggestions(false);
                navigateToResult(s);
              }}
            >
              <Text style={styles.suggestionIcon}>{typeIcon[s.type]}</Text>
              <Text style={styles.suggestionText} numberOfLines={1}>
                {s.name}
              </Text>
              <View style={styles.suggestionBadge}>
                <Text style={styles.suggestionBadgeText}>{typeLabel[s.type]}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.type}-${item.id}-${i}`}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => navigateToResult(item)}
            >
              <Text style={styles.resultIcon}>{typeIcon[item.type]}</Text>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.detail && (
                  <Text style={styles.resultDetail} numberOfLines={2}>
                    {item.detail}
                  </Text>
                )}
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{typeLabel[item.type]}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && query.trim().length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                <Text style={styles.emptyHint}>
                  Farklı anahtar kelimeler deneyin
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBox: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
  },
  suggestionsBox: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionIcon: { fontSize: 16, marginRight: spacing.sm },
  suggestionText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  suggestionBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  suggestionBadgeText: { fontSize: fontSize.xs, color: colors.textMuted },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIcon: { fontSize: 24, marginRight: spacing.md },
  resultContent: { flex: 1 },
  resultName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  resultDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  typeBadgeText: { fontSize: fontSize.xs, color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  emptyHint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
});
