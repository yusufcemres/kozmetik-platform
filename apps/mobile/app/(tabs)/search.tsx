import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { apiClient } from '@/services/api';

interface SearchResult {
  type: 'product' | 'ingredient' | 'need';
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.get<{ results: SearchResult[] }>(
        `/search?q=${encodeURIComponent(text)}`,
      );
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item: SearchResult) => {
    const routes: Record<string, string> = {
      product: `/product/${item.slug}`,
      ingredient: `/ingredient/${item.slug}`,
      need: `/need/${item.slug}`,
    };
    router.push(routes[item.type] as any);
  };

  const typeIcon: Record<string, string> = {
    product: '📦',
    ingredient: '🧪',
    need: '🎯',
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Ürün, içerik veya ihtiyaç ara..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handlePress(item)}>
            <Text style={styles.resultIcon}>{typeIcon[item.type]}</Text>
            <View style={styles.resultText}>
              <Text style={styles.resultName}>{item.name}</Text>
              {item.subtitle && (
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>Sonuç bulunamadı</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loader: { marginTop: spacing.md },
  list: { padding: spacing.md },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIcon: { fontSize: 24, marginRight: spacing.sm },
  resultText: { flex: 1 },
  resultName: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  resultSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontSize: fontSize.md,
  },
});
