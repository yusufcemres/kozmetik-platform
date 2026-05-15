#!/usr/bin/env node
/**
 * Skin-Analysis endpoint manuel test scripti.
 *
 * Kullanım:
 *   # Lokal API:
 *   API=http://localhost:3001 node scripts/manual-tests/test-skin-analysis.mjs path/to/face.jpg
 *
 *   # Production (Render):
 *   API=https://kozmetik-api.onrender.com node scripts/manual-tests/test-skin-analysis.mjs path/to/face.jpg
 *
 * Çıktılar:
 *   - HTTP status + response time
 *   - Skor JSON (6-boyut breakdown)
 *   - Overall + INCI öneriler
 *   - Validation hataları (varsa)
 *
 * Not: GEMINI_API_KEY veya ANTHROPIC_API_KEY API tarafında set olmalı.
 *      Aksi halde 400 "Vision servisi yanıt vermedi" döner.
 */
import { readFileSync, statSync } from 'fs';
import { extname } from 'path';

const API = (process.env.API || 'http://localhost:3001').replace(/\/$/, '');
const PATH = process.argv[2];

if (!PATH) {
  console.error('Usage: node test-skin-analysis.mjs <image-path>');
  console.error('Example: node test-skin-analysis.mjs ~/Pictures/test-face.jpg');
  process.exit(1);
}

const ext = extname(PATH).toLowerCase().slice(1);
const MIME_MAP = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const mime = MIME_MAP[ext];
if (!mime) {
  console.error(`Geçersiz dosya tipi: ${ext}. Sadece jpg/jpeg/png/webp.`);
  process.exit(1);
}

const stat = statSync(PATH);
const sizeMB = stat.size / 1024 / 1024;
if (sizeMB > 5) {
  console.error(`Dosya çok büyük: ${sizeMB.toFixed(2)}MB (max 5MB)`);
  process.exit(1);
}

console.log(`📸 Yükleniyor: ${PATH} (${sizeMB.toFixed(2)}MB, ${mime})`);
console.log(`🌐 API: ${API}/api/v1/skin-analysis`);
console.log('');

const buffer = readFileSync(PATH);
const base64 = buffer.toString('base64');

const startTs = Date.now();

try {
  const res = await fetch(`${API}/api/v1/skin-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: base64,
      image_mime: mime,
    }),
  });

  const ms = Date.now() - startTs;
  console.log(`⏱️  Response time: ${ms}ms`);
  console.log(`📡 HTTP ${res.status} ${res.statusText}`);
  console.log('');

  const body = await res.json();

  if (!res.ok) {
    console.error('❌ Hata:');
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log('✅ Analiz başarılı');
  console.log('');
  console.log('📊 6-Boyut Skor:');
  for (const [dim, score] of Object.entries(body.scores)) {
    const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
    console.log(`  ${dim.padEnd(22)} ${String(score).padStart(3)} ${bar}`);
  }
  console.log('');
  console.log(`🎯 Genel Skor: ${body.overall_score}/100`);
  console.log(`🤖 Model: ${body.model_version}`);
  console.log(`🆔 Analysis ID: ${body.analysis_id}`);
  console.log('');

  if (Object.keys(body.recommendations).length > 0) {
    console.log('💡 INCI Önerileri (sorunlu boyutlar ≥40):');
    for (const [dim, inciList] of Object.entries(body.recommendations)) {
      console.log(`  ${dim}:`);
      for (const inci of inciList) {
        console.log(`    • ${inci}`);
      }
    }
  } else {
    console.log('💡 Tüm boyutlar normal aralıkta — öneri yok');
  }
} catch (err) {
  console.error(`💥 Network error: ${err.message}`);
  process.exit(1);
}
