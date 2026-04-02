import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface Props {
  label: string;
  score: number; // 0-100
  showPersonal?: boolean;
  personalScore?: number;
  penalties?: string[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return '#84CC16'; // lime
  if (score >= 40) return colors.warning;
  return colors.error;
}

export default function ScoreBar({ label, score, showPersonal, personalScore, penalties }: Props) {
  const color = getScoreColor(score);
  const personalColor = personalScore != null ? getScoreColor(personalScore) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.scoreText, { color }]}>%{Math.round(score)}</Text>
      </View>

      {/* Main bar */}
      <View style={styles.trackOuter}>
        <View style={[styles.trackFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>

      {/* Personal score */}
      {showPersonal && personalScore != null && (
        <View style={styles.personalRow}>
          <Text style={styles.personalLabel}>Sana uyumu:</Text>
          <Text style={[styles.personalScore, { color: personalColor }]}>
            %{Math.round(personalScore)}
          </Text>
          {penalties && penalties.length > 0 && (
            <Text style={styles.penaltyHint}>
              {' '}({penalties.join(', ')})
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  scoreText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  trackOuter: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  personalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  personalLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  personalScore: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginLeft: 4,
  },
  penaltyHint: {
    fontSize: fontSize.xs,
    color: colors.warning,
  },
});
