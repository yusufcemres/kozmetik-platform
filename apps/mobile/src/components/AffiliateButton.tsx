import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AffiliateLink } from '../services/api';
import { openAffiliateLink } from '../services/deeplink';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface Props {
  links: AffiliateLink[];
}

const platformLabels: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon_tr: 'Amazon TR',
  dermoeczanem: 'Dermoeczanem',
  gratis: 'Gratis',
  other: 'Diğer',
};

const platformColors: Record<string, string> = {
  trendyol: '#F27A1A',
  hepsiburada: '#FF6000',
  amazon_tr: '#FF9900',
  dermoeczanem: '#00A651',
  gratis: '#E91E63',
  other: '#6B7280',
};

export default function AffiliateButton({ links }: Props) {
  const activeLinks = links.filter((l) => l.is_active);

  if (activeLinks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nereden Alınır?</Text>

      <View style={styles.linksRow}>
        {activeLinks.map((link) => {
          const label = platformLabels[link.platform] || link.platform;
          const bgColor = platformColors[link.platform] || colors.textSecondary;

          return (
            <TouchableOpacity
              key={link.affiliate_link_id}
              style={[styles.linkButton, { backgroundColor: bgColor }]}
              onPress={() => openAffiliateLink(link.platform, link.affiliate_url)}
            >
              <Text style={styles.linkLabel}>{label}</Text>
              {link.price_snapshot != null && (
                <Text style={styles.linkPrice}>₺{link.price_snapshot}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.disclosure}>
        Bağımsız platformuz, komisyon alınan linkler içerebilir.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  linkButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  linkLabel: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  linkPrice: {
    color: colors.white,
    fontSize: fontSize.xs,
    marginTop: 2,
    opacity: 0.9,
  },
  disclosure: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
