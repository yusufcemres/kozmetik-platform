#!/usr/bin/env node
/**
 * 28-gün reminder cron'unu manuel olarak tetiklemek için DB hilesi.
 *
 * Production'da cron her sabah 09:00 (Europe/Istanbul) çalışır. Test sırasında
 * 28 gün beklemek pratik değil → seçilen analiz kaydının created_at'ini 29 gün
 * geriye çekeriz + reminder_email_sent_at'i NULL'a sıfırlarız → cron next run'da
 * (veya elle çağrılınca) reminder yollar.
 *
 * Kullanım:
 *   DATABASE_URL=postgres://... ANALYSIS_ID=42 \
 *     node scripts/manual-tests/simulate-28day-reminder.mjs
 *
 *   # Sonra ya 09:00'ı bekle, ya da Render shell'den service.sendDueReminders()
 *   # çağır (geliştirme için: endpoint açmak istemiyorsan).
 *
 * Önkoşul: ANALYSIS_ID'in subscription_email NOT NULL olmalı (önce
 * test-skin-analysis-funnel.mjs ile subscribe et).
 */
import pg from 'pg';

const ANALYSIS_ID = process.env.ANALYSIS_ID;
const DATABASE_URL = process.env.DATABASE_URL;

if (!ANALYSIS_ID || !DATABASE_URL) {
  console.error('Usage: DATABASE_URL=postgres://... ANALYSIS_ID=42 node simulate-28day-reminder.mjs');
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

try {
  await client.connect();
  console.log(`🌐 DB connected`);

  // Önce mevcut durumu göster
  const before = await client.query(
    `SELECT analysis_id, subscription_email, created_at, welcome_email_sent_at, reminder_email_sent_at, unsubscribed_at
     FROM skin_analysis_results WHERE analysis_id = $1`,
    [ANALYSIS_ID],
  );
  if (before.rows.length === 0) {
    console.error(`❌ analysis_id=${ANALYSIS_ID} bulunamadı`);
    process.exit(1);
  }
  const row = before.rows[0];
  console.log('📊 Mevcut durum:');
  console.log(`   subscription_email:     ${row.subscription_email ?? '(NULL)'}`);
  console.log(`   created_at:             ${row.created_at?.toISOString()}`);
  console.log(`   welcome_email_sent_at:  ${row.welcome_email_sent_at?.toISOString() ?? '(NULL)'}`);
  console.log(`   reminder_email_sent_at: ${row.reminder_email_sent_at?.toISOString() ?? '(NULL)'}`);
  console.log(`   unsubscribed_at:        ${row.unsubscribed_at?.toISOString() ?? '(NULL)'}`);
  console.log('');

  if (!row.subscription_email) {
    console.error('❌ subscription_email NULL — önce test-skin-analysis-funnel.mjs ile subscribe et');
    process.exit(1);
  }
  if (row.unsubscribed_at) {
    console.error('❌ Kullanıcı zaten unsubscribed — re-subscribe edip tekrar dene');
    process.exit(1);
  }

  // Backdate + reminder reset
  const upd = await client.query(
    `UPDATE skin_analysis_results
     SET created_at = NOW() - INTERVAL '29 days',
         reminder_email_sent_at = NULL
     WHERE analysis_id = $1
     RETURNING created_at`,
    [ANALYSIS_ID],
  );
  console.log(`✓ created_at → ${upd.rows[0].created_at.toISOString()} (29 gün önce)`);
  console.log(`✓ reminder_email_sent_at → NULL`);
  console.log('');

  console.log('⏭️  Sonraki adım:');
  console.log('  → Render cron 09:00 TR\'da otomatik çalışacak.');
  console.log('  → Daha hızlı test için Render shell\'den manuel trigger:');
  console.log('       node -e "require(\'./dist/main\').then(app => app.get(\'SkinAnalysisService\').sendDueReminders())"');
  console.log('  → Doğrulama: birkaç dakika sonra reminder mailini bekle + DB\'de reminder_email_sent_at dolar.');
} catch (err) {
  console.error('💥 Error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
