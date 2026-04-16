import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

interface Props {
  score: number;
  grade?: Grade;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number) {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#84CC16';
  if (score >= 55) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function deriveGrade(score: number): Grade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

const SIZE_MAP = {
  sm: { diameter: 40, border: 2, font: fontSize.sm, gradeFont: 10 },
  md: { diameter: 64, border: 3, font: fontSize.xl, gradeFont: 11 },
  lg: { diameter: 96, border: 4, font: 32, gradeFont: 12 },
};

export default function ScoreBadge({ score, grade, size = 'md' }: Props) {
  const color = getScoreColor(score);
  const resolvedGrade = grade ?? deriveGrade(score);
  const cfg = SIZE_MAP[size];

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.circle,
          {
            width: cfg.diameter,
            height: cfg.diameter,
            borderRadius: cfg.diameter / 2,
            borderWidth: cfg.border,
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.score, { color, fontSize: cfg.font }]}>{score}</Text>
      </View>
      {size !== 'sm' && (
        <Text style={[styles.grade, { color, fontSize: cfg.gradeFont }]}>{resolvedGrade}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  score: { fontWeight: '800' },
  grade: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
