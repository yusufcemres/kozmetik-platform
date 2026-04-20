import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import ScoreBadge from './ScoreBadge';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { config } from '../constants/config';
import type { SupplementScore, CosmeticScore, ExplanationItem } from '../services/api';

type AnyScore = SupplementScore | CosmeticScore;

interface Props {
  score: AnyScore;
}

const COSMETIC_LABELS: Record<string, string> = {
  active_efficacy: 'Aktif Etkinlik',
  safety_class: 'Güvenlik Sınıfı',
  concentration_fit: 'Konsantrasyon',
  interaction_safety: 'Etkileşim',
  allergen_load: 'Alerjen Yükü',
  cmr_endocrine: 'CMR / Endokrin',
  transparency: 'Şeffaflık',
};

const SUPPLEMENT_LABELS: Record<string, string> = {
  form_quality: 'Form Kalitesi',
  dose_efficacy: 'Doz Etkinliği',
  evidence_grade: 'Kanıt Seviyesi',
  third_party_testing: 'Third-Party Test',
  interaction_safety: 'Etkileşim Güvenliği',
  transparency_and_tier: 'Şeffaflık & Üretim',
};

function barColor(v: number) {
  if (v >= 85) return '#22C55E';
  if (v >= 70) return '#84CC16';
  if (v >= 55) return '#F59E0B';
  if (v >= 40) return '#F97316';
  return '#EF4444';
}

function gradeLabel(grade: string) {
  switch (grade) {
    case 'A': return 'Çok İyi';
    case 'B': return 'İyi';
    case 'C': return 'Orta';
    case 'D': return 'Zayıf';
    case 'F': return 'Kaçınılmalı';
    default: return '';
  }
}

function citationLabel(cit: ExplanationItem['citation']) {
  if (!cit) return null;
  if (cit.pmid) return `PubMed · ${cit.pmid}`;
  if (cit.doi) return `DOI · ${cit.doi}`;
  if (cit.opinion_ref) return `SCCS · ${cit.opinion_ref}`;
  return cit.source;
}

function floorCapMessage(cap?: string): string | null {
  if (!cap) return null;
  const map: Record<string, string> = {
    eu_banned: 'AB’de yasaklı içerik (Annex II) tespit edildi.',
    cmr_1a: 'CMR 1A sınıfı içerik — kanserojen/mutajen risk.',
    cmr_1b: 'CMR 1B sınıfı içerik — olası kanserojen risk.',
    iarc_1: 'IARC Grup 1 (kesin kanserojen) içerik.',
    ul_exceeded: 'Tolerable Upper Intake Level (UL) aşıldı.',
    harmful_interactions: '≥2 zararlı etkileşim çifti.',
    low_evidence: 'Yetersiz kanıt seviyesi.',
    missing_safety_data: 'İçerik güvenlik verisi %50+ eksik.',
  };
  return map[cap] || `Tavan: ${cap}`;
}

export default function EvidenceScoreCard({ score }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isSupplement = 'form_quality' in score.breakdown;
  const labels = isSupplement ? SUPPLEMENT_LABELS : COSMETIC_LABELS;
  const bd = score.breakdown as Record<string, number>;

  const flagsAny = score.flags as any;
  const warnings: string[] = [];
  if (flagsAny.eu_banned?.length) warnings.push(`AB yasaklı: ${flagsAny.eu_banned.join(', ')}`);
  if (flagsAny.cmr?.length) warnings.push(`CMR: ${flagsAny.cmr.join(', ')}`);
  if (flagsAny.endocrine?.length) warnings.push(`Endokrin: ${flagsAny.endocrine.join(', ')}`);
  if (flagsAny.harmful?.length) warnings.push(`Dikkat: ${flagsAny.harmful.join(', ')}`);
  if (flagsAny.ul_exceeded?.length) warnings.push(`UL aşımı: ${flagsAny.ul_exceeded.join(', ')}`);
  if (flagsAny.harmful_interactions?.length) warnings.push(`Etkileşim: ${flagsAny.harmful_interactions.join(', ')}`);

  const capMsg = floorCapMessage(score.floor_cap_applied);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ScoreBadge score={score.overall_score} grade={score.grade} size="lg" />
        <View style={styles.headerText}>
          <Text style={styles.title}>REVELA Skoru</Text>
          <Text style={styles.subtitle}>{gradeLabel(score.grade)}</Text>
          <Text style={styles.version}>Algoritma: {score.algorithm_version}</Text>
        </View>
      </View>

      {capMsg && (
        <View style={styles.capBanner}>
          <Text style={styles.capText}>⚠ {capMsg}</Text>
        </View>
      )}

      {warnings.length > 0 && (
        <View style={styles.warnBox}>
          {warnings.map((w, i) => (
            <Text key={i} style={styles.warnText}>• {w}</Text>
          ))}
        </View>
      )}

      <View style={styles.breakdown}>
        {Object.entries(labels).map(([key, label]) => {
          const v = bd[key] ?? 0;
          return (
            <View key={key} style={styles.row}>
              <View style={styles.rowHead}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={[styles.rowValue, { color: barColor(v) }]}>{Math.round(v)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, v))}%`, backgroundColor: barColor(v) }]} />
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.expand} onPress={() => setExpanded((x) => !x)}>
        <Text style={styles.expandText}>
          {expanded ? 'Açıklamayı gizle' : 'Bu puan neden?'}
        </Text>
      </TouchableOpacity>

      {expanded && score.explanation.length > 0 && (
        <View style={styles.explanation}>
          {score.explanation.map((item, i) => {
            const cLabel = citationLabel(item.citation);
            return (
              <View key={i} style={styles.explainItem}>
                <Text style={styles.explainReason}>• {item.reason}</Text>
                {cLabel && item.citation?.url ? (
                  <TouchableOpacity onPress={() => Linking.openURL(item.citation!.url!)}>
                    <Text style={styles.citationLink}>↗ {cLabel}</Text>
                  </TouchableOpacity>
                ) : cLabel ? (
                  <Text style={styles.citation}>{cLabel}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        onPress={() => Linking.openURL(`${config.webUrl}/nasil-puanliyoruz`)}
        style={styles.methodologyLink}
        accessibilityRole="link"
        accessibilityLabel="Puanlama metodolojisi sayfasını aç"
      >
        <Text style={styles.methodologyText}>Metodoloji →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  version: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  capBanner: {
    marginTop: spacing.md,
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  capText: { color: '#B91C1C', fontSize: fontSize.sm, fontWeight: '600' },
  warnBox: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  warnText: { color: '#B45309', fontSize: fontSize.xs, lineHeight: 18 },
  breakdown: { marginTop: spacing.md },
  row: { marginBottom: spacing.sm },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  rowValue: { fontSize: fontSize.sm, fontWeight: '700' },
  track: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: borderRadius.full },
  expand: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expandText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  explanation: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  explainItem: { marginBottom: spacing.sm },
  explainReason: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  citation: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginLeft: spacing.sm },
  citationLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
    marginLeft: spacing.sm,
    textDecorationLine: 'underline',
  },
  methodologyLink: { marginTop: spacing.md, alignSelf: 'flex-end' },
  methodologyText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '600' },
});
