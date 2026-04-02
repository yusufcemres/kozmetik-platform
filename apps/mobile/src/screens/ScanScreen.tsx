import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

// Note: Camera and barcode scanning will be implemented with expo-camera
// For now, this is a placeholder UI with manual barcode entry

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function ScanScreen() {
  const [mode, setMode] = useState<'barcode' | 'ocr'>('barcode');

  return (
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'barcode' && styles.modeButtonActive]}
          onPress={() => setMode('barcode')}
        >
          <Text style={[styles.modeText, mode === 'barcode' && styles.modeTextActive]}>
            Barkod Tara
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'ocr' && styles.modeButtonActive]}
          onPress={() => setMode('ocr')}
        >
          <Text style={[styles.modeText, mode === 'ocr' && styles.modeTextActive]}>
            Etiket OCR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera placeholder */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraIcon}>{mode === 'barcode' ? '📷' : '📝'}</Text>
        <Text style={styles.cameraTitle}>
          {mode === 'barcode' ? 'Barkodu Kameraya Göster' : 'INCI Etiketini Çek'}
        </Text>
        <Text style={styles.cameraSubtitle}>
          {mode === 'barcode'
            ? 'Ürün barkodunu tararak anında analiz et'
            : 'INCI listesi fotoğrafını çekerek ingredient analizi yap'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Nasıl çalışır?</Text>
        {mode === 'barcode' ? (
          <>
            <Text style={styles.infoStep}>1. Ürün barkodunu kameraya göster</Text>
            <Text style={styles.infoStep}>2. Veritabanımızda varsa direkt analiz görüntüle</Text>
            <Text style={styles.infoStep}>3. Yoksa fotoğraf çek, biz ekleyelim</Text>
          </>
        ) : (
          <>
            <Text style={styles.infoStep}>1. Ürünün INCI listesinin fotoğrafını çek</Text>
            <Text style={styles.infoStep}>2. OCR ile metin otomatik okunur</Text>
            <Text style={styles.infoStep}>3. Her ingredient analiz edilir</Text>
          </>
        )}
      </View>

      {/* Action button placeholder */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => Alert.alert('Yakında', 'Kamera entegrasyonu expo-camera ile gelecek.')}
      >
        <Text style={styles.scanButtonText}>
          {mode === 'barcode' ? 'Taramayı Başlat' : 'Fotoğraf Çek'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.white,
  },
  cameraPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cameraIcon: { fontSize: 64, marginBottom: spacing.md },
  cameraTitle: {
    fontSize: fontSize.lg, fontWeight: '700', color: colors.text, textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs,
  },
  infoBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: fontSize.md, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm,
  },
  infoStep: {
    fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 4, paddingLeft: spacing.sm,
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
});
