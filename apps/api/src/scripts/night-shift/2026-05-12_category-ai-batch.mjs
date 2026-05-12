/**
 * FAZ 13 — Kategorisiz (category_id=1 default) draft urunler icin AI ile bulk kategori atama.
 * Sonnet 4.5'a 20'lik batch ile ad+marka -> category_slug oner.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const BATCH_SIZE = 20;
const PARALLEL = 3;

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function categorizeBatch(products, catList) {
  const catTable = catList.map((c) => `- ${c.slug}: ${c.name}`).join('\n');
  const items = products.map((p) => `${p.product_id}: ${p.brand_name || '?'} / ${p.product_name}`).join('\n');
  const prompt = `Sen kozmetik kategori uzmanısın. Her ürünü doğru kategoriye eşle.

KATEGORI LİSTESİ (sadece bu slug'ları kullan):
${catTable}

ÜRÜNLER:
${items}

Her ürün için product_id ve category_slug döndür. JSON array (SADECE JSON):
[{"product_id": 123, "category_slug": "nemlendirici-krem"}, ...]

Kurallar:
- SADECE listedeki slug'ları kullan
- Emin değilsen 'yuz-bakim' kullan (genel)
- Kategoriler:
  - yuz-bakim: genel yüz, tonik, maske, essence
  - nemlendirici-krem: yüz nemlendirici krem
  - serum-ampul: serum, ampul, essence
  - yuz-temizleme-jeli: jel, köpük temizleyici
  - misel-su: misel su
  - yuz-gunes-kremi: yüz SPF
  - vucut-gunes-kremi: vücut SPF
  - goz-kremi: göz krem
  - goz-serumu: göz serum
  - dudak-nemlendirici: lip balm, ruj
  - dudak-bakim: lip mask, lip oil
  - vucut-nemlendirici: vücut krem
  - vucut-losyonu: body lotion
  - vucut-bakim: deodorant, roll-on, kolonya
  - sampuan: şampuan
  - sac-bakim: saç kremi, mask, oil
  - sabun: bar sabun, katı sabun, yıkama köpüğü
  - temizleme: genel temizleme
  - makyaj: fondöten, maskara, eyeliner
  - fondoten-bb-krem: fondöten, BB, CC krem

Bilmiyorsan 'yuz-bakim' yaz.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const d = await r.json();
  const text = d.content[0].text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[1]);
}

await client.connect();

const cats = (await client.query(`SELECT category_id, category_slug, category_name FROM categories WHERE domain_type='cosmetic' AND is_active=true ORDER BY category_id`)).rows;
const catMap = new Map(cats.map((c) => [c.category_slug, c.category_id]));
const catList = cats.map((c) => ({ slug: c.category_slug, name: c.category_name }));

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '600');
const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status='draft' AND (p.category_id = 1 OR p.category_id IS NULL) AND p.product_name IS NOT NULL
  ORDER BY p.product_id DESC
  LIMIT $1
`, [LIMIT]);
console.log(`Targets: ${targets.length}\n`);

// Batch'le
const batches = [];
for (let i = 0; i < targets.length; i += BATCH_SIZE) batches.push(targets.slice(i, i + BATCH_SIZE));
console.log(`Batches: ${batches.length}\n`);

let success = 0, failed = 0;
for (let i = 0; i < batches.length; i += PARALLEL) {
  const chunk = batches.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (batch, idx) => {
    try {
      const mappings = await categorizeBatch(batch, catList);
      let updated = 0;
      for (const m of mappings) {
        const catId = catMap.get(m.category_slug);
        if (!catId) continue;
        await client.query(`UPDATE products SET category_id = $1, updated_at = NOW() WHERE product_id = $2`, [catId, m.product_id]);
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
console.log(`\n=== Done: ${success} products categorized, ${failed} batches failed ===`);
await client.end();
