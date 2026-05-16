#!/usr/bin/env node
/**
 * Skin-Analysis email funnel manuel test (Faz 1 Gün 9-10).
 *
 * Test akışı:
 *   1. POST /:id/subscribe — email opt-in (welcome mail tetiklenir)
 *   2. GET  /unsubscribe/:token — opt-out
 *   3. (opsiyonel) POST tekrar subscribe — re-subscribe idempotency
 *
 * Kullanım:
 *   ANALYSIS_ID=42 EMAIL=test@example.com \
 *     node scripts/manual-tests/test-skin-analysis-funnel.mjs
 *
 *   # Production:
 *   API=https://kozmetik-api.onrender.com ANALYSIS_ID=42 EMAIL=test@example.com \
 *     node scripts/manual-tests/test-skin-analysis-funnel.mjs
 *
 * Önkoşul: Test edilen analysis_id DB'de mevcut olmalı
 *   (önce test-skin-analysis.mjs ile bir analiz yap, dönen ID'yi kullan).
 *
 * Doğrulama: Welcome mail Resend'ten geliyor mu (inbox), unsubscribe link
 * çalışıyor mu (token tek tıkla DB'yi günceller).
 */
const API = (process.env.API || 'http://localhost:3001').replace(/\/$/, '');
const ANALYSIS_ID = process.env.ANALYSIS_ID;
const EMAIL = process.env.EMAIL;

if (!ANALYSIS_ID || !EMAIL) {
  console.error('Usage: ANALYSIS_ID=<id> EMAIL=<email> node test-skin-analysis-funnel.mjs');
  console.error('Example: ANALYSIS_ID=42 EMAIL=test@example.com node test-skin-analysis-funnel.mjs');
  process.exit(1);
}

async function step(label, fn) {
  process.stdout.write(`${label}... `);
  const t = Date.now();
  try {
    const result = await fn();
    console.log(`✓ (${Date.now() - t}ms)`);
    if (result) console.log('  →', JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(`✗ (${Date.now() - t}ms)`);
    console.log('  ✗', err.message);
    return null;
  }
}

async function apiCall(path, options = {}) {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

console.log(`🌐 API: ${API}`);
console.log(`🆔 Analysis: ${ANALYSIS_ID}`);
console.log(`📧 Email:   ${EMAIL}`);
console.log('');

// 1. Subscribe
const sub = await step('1. POST /:id/subscribe (welcome mail tetikler)', () =>
  apiCall(`/skin-analysis/${ANALYSIS_ID}/subscribe`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL }),
  }),
);
if (!sub) process.exit(1);

// 2. Re-subscribe (idempotency check)
await step('2. Aynı email tekrar subscribe (idempotent → already_subscribed)', () =>
  apiCall(`/skin-analysis/${ANALYSIS_ID}/subscribe`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL }),
  }),
);

// 3. DB doğrulama (unsubscribe token al)
console.log('');
console.log('⏸  Manuel adım:');
console.log(`  → Inbox kontrol: "REVELA cilt analizin kaydedildi 🌿" maili geldi mi?`);
console.log(`  → Mail içinde unsubscribe link → tıkla → /cilt-analizi/abonelik-iptal?token=XXX`);
console.log(`  → Token kopyala, sonraki adımda kullan.`);
console.log('');
console.log('Token al, devam etmek için:');
console.log(`  UNSUB_TOKEN=<token> ANALYSIS_ID=${ANALYSIS_ID} EMAIL=${EMAIL} \\`);
console.log(`    node scripts/manual-tests/test-skin-analysis-funnel.mjs unsubscribe`);
console.log('');

const cmd = process.argv[2];
if (cmd === 'unsubscribe') {
  const token = process.env.UNSUB_TOKEN;
  if (!token) {
    console.error('UNSUB_TOKEN env değişkeni gerekli.');
    process.exit(1);
  }
  await step(`4. GET /unsubscribe/${token.slice(0, 8)}…`, () =>
    apiCall(`/skin-analysis/unsubscribe/${encodeURIComponent(token)}`),
  );
  await step('5. Geçersiz token (enumeration koruması — yine success dönmeli)', () =>
    apiCall(`/skin-analysis/unsubscribe/${'a'.repeat(64)}`),
  );
}

console.log('');
console.log('✅ Funnel test tamamlandı.');
console.log('   DB doğrulaması (psql ile):');
console.log(`     SELECT subscription_email, welcome_email_sent_at, unsubscribed_at`);
console.log(`     FROM skin_analysis_results WHERE analysis_id = ${ANALYSIS_ID};`);
