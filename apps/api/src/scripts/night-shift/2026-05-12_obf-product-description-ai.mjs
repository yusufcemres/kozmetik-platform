/**
 * FAZ 21 — OBF'ten gelen draft urunlerin "OpenBeautyFacts'ten eklendi" placeholder
 * short_description'larini AI ile gercek aciklamaya cevir.
 * Batch 25 urun/cag, paralel 3.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const BATCH_SIZE = 25;
const PARALLEL = 3;
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '1500');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function describeBatch(products) {
  const items = products.map((p) => `${p.product_id}: ${p.brand_name || '?'} / ${p.product_name}`).join('\n');
  const prompt = `Sen kozmetik editorusun. Her urun icin 1-2 cumlelik Turkce kisa aciklama yaz (max 280 karakter, marka adi + urun fonksiyonu + ana iddia).

URUNLER:
${items}

Sadece JSON dondur (baska aciklama YOK):
[{"product_id": 123, "short_description": "..."}, ...]

Kurallar:
- 200-280 karakter aralik
- Marka adini cumle icine dogal yedir
- Iddia abartisiz (cilt tipini, fonksiyonu vurgula)
- "OpenBeautyFacts" sozcugu YASAK
- Emoji YASAK`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const d = await r.json();
  const text = d.content[0].text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[1]);
}

await client.connect();

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status='draft' AND p.short_description LIKE '%OpenBeautyFacts%' AND p.product_name IS NOT NULL
  ORDER BY p.product_id DESC
  LIMIT $1
`, [LIMIT]);
console.log(`Targets: ${targets.length}\n`);

const batches = [];
for (let i = 0; i < targets.length; i += BATCH_SIZE) batches.push(targets.slice(i, i + BATCH_SIZE));
console.log(`Batches: ${batches.length}\n`);

let success = 0, failed = 0;
for (let i = 0; i < batches.length; i += PARALLEL) {
  const chunk = batches.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (batch, idx) => {
    try {
      const descs = await describeBatch(batch);
      let updated = 0;
      for (const item of descs) {
        const desc = (item.short_description || '').slice(0, 500);
        if (desc.length < 50) continue;
        await client.query(`UPDATE products SET short_description=$1, updated_at=NOW() WHERE product_id=$2`, [desc, item.product_id]);
        updated++;
      }
      return { idx: i + idx, count: updated, total: batch.length };
    } catch (e) {
      throw { idx: i + idx, error: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled') { success += r.value.count; console.log(`✓ batch ${r.value.idx}: ${r.value.count}/${r.value.total}`); }
    else { failed++; console.log(`✗ batch ${r.reason?.idx}: ${r.reason?.error}`); }
  }
}
console.log(`\n=== Done: ${success} products described, ${failed} batches failed ===`);
await client.end();
