import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { search, searchSuggest, SearchResult } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Search'>;
type Route = RouteProp<HomeStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [query, setQuery] = useState(route.params?.query || '');
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
    if (route.params?.query) doSearch(route.params.query);
  }, [route.params?.query, doSearch]);

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
    }
  };

  const navigateToResult = (item: SearchResult) => {
    switch (item.type) {
      case 'product':
        navigation.navigate('ProductDetail', { slug: item.slug });
        break;
      case 'ingredient':
        navigation.navigate('IngredientDetail', { slug: item.slug });
        break;
      case 'need':
        navigation.navigate('NeedDetail', { slug: item.slug });
        break;
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Ara..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => doSearch(query)}
          returnKeyType="search"
          autoFocus
        />
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.slice(0, 6).map((s, i) => (
            <TouchableOpacity
              key={`${s.type}-${s.id}-${i}`}
              style={styles.suggestionItem}
              onPress={() => {
                setQuery(s.name);
                setShowSuggestions(false);
                navigateToResult(s);
              }}
            >
              <Text style={styles.suggestionIcon}>{typeIcon[s.type]}</Text>
              <Text style={styles.suggestionText}>{s.name}</Text>
              <Text style={styles.suggestionType}>{typeLabel[s.type]}</Text>
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
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} onPress={() => navigateToResult(item)}>
              <Text style={styles.resultIcon}>{typeIcon[item.type]}</Text>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.detail && (
                  <Text style={styles.resultDetail}>{item.detail}</Text>
                )}
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{typeLabel[item.type]}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && query.trim() ? (
              <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBox: {
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionIcon: { fontSize: 16, marginRight: spacing.sm },
  suggestionText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  suggestionType: { fontSize: fontSize.xs, color: colors.textMuted },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIcon: { fontSize: 24, marginRight: spacing.md },
  resultContent: { flex: 1 },
  resultName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  resultDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  typeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: { fontSize: fontSize.xs, color: colors.textSecondary },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
