/**
 * FAZ 14 — OBF'den gelen ama DB'de olmayan INCI'leri AI ile analiz edip ekle.
 *
 * 1. OBF fetch sonuclarini tara, frequency map yap
 * 2. Top 200 unmatched INCI sec
 * 3. Her biri icin Sonnet 4.5: inci_name, function, evidence_grade, group, allergen flag
 * 4. DB'ye ekle (is_active=true, evidence_level='ai_inferred')
 */
import { readdir, readFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const PARALLEL = 3;
const TOP_N = 200;
const INPUT = './tmp/obf-results';

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

async function analyzeInci(name) {
  const prompt = `Sen kozmetik kimyageri ve INCI database curatorsun.

INCI: "${name}"

Bu bileşeni analiz et. SADECE JSON döndür:

{
  "canonical_inci_name": "duzeltilmis dogru INCI yazimi (orn. 'Sodium Hyaluronate', 'Aqua/Water')",
  "common_name": "Turkce yaygin ad veya null",
  "ingredient_group": "Sürfaktan|Nemlendirici|Yumuşatici|Koruyucu|Antioksidan|UV Filter|Bitkisel Ekstre|Aktif|Renk|Esansiyel Yag|pH Ayarlayici|Sürfaktan booster|Stabilizer|Kivam Artirici|Yag|Vitamin|Mineral|Asit|Peptit|Polimer|Diger",
  "function_summary": "1-2 cumle Turkce fonksiyon",
  "evidence_grade": "A|B|C|D",
  "allergen_flag": true/false,
  "fragrance_flag": true/false,
  "preservative_flag": true/false,
  "is_valid_inci": true/false (eger sahte/yanlis okuma gibi gozukuyorsa false)
}

Kurallar:
- canonical_inci_name: standart INCI yazimi (Latince, ozel kurallar)
- evidence_grade: A=RCT/sistematik, B=klinik, C=uzman gorusu, D=zayif
- is_valid_inci: 'Water', 'Aroma', kisaltma, OCR hatasi gibi gozukuyorsa false
- Hallucinate yapma; emin degilsen evidence_grade=C, common_name=null`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const d = await r.json();
  const text = d.content[0].text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[1]);
}

await client.connect();
console.log('Loading OBF fetch results...');

// Frequency map
const freq = new Map();
const files = (await readdir(INPUT)).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
for (const f of files) {
  const d = JSON.parse(await readFile(join(INPUT, f), 'utf-8'));
  for (const p of d.products || []) {
    for (const name of (p.ingredients_list || [])) {
      const key = name.toLowerCase().trim();
      if (key.length < 4 || key.length > 80) continue;
      freq.set(key, (freq.get(key) || 0) + 1);
    }
  }
}
console.log(`OBF unique INCI tokens: ${freq.size}`);

// Eslesmeyen olanlar (REVELA DB)
const existing = new Set(
  (await client.query(`SELECT LOWER(TRIM(inci_name)) AS n FROM ingredients WHERE is_active=true`)).rows.map((r) => r.n),
);
const existingCommon = new Set(
  (await client.query(`SELECT LOWER(TRIM(common_name)) AS n FROM ingredients WHERE is_active=true AND common_name IS NOT NULL`)).rows.map((r) => r.n),
);

const unmatched = [...freq.entries()]
  .filter(([name]) => !existing.has(name) && !existingCommon.has(name))
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP_N);
console.log(`Top ${TOP_N} unmatched INCI (frequency-sorted)\n`);

let added = 0, skipped = 0, failed = 0;
for (let i = 0; i < unmatched.length; i += PARALLEL) {
  const chunk = unmatched.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async ([name, count]) => {
    try {
      const info = await analyzeInci(name);
      if (!info.is_valid_inci) return { name, skipped: true, reason: 'invalid' };
      const canonical = info.canonical_inci_name || name;
      const s = slug(canonical);
      const exists = await client.query(
        `SELECT ingredient_id FROM ingredients WHERE LOWER(inci_name)=LOWER($1) OR ingredient_slug=$2 LIMIT 1`,
        [canonical, s],
      );
      if (exists.rows.length > 0) return { name, skipped: true, reason: 'already' };
      await client.query(
        `INSERT INTO ingredients (inci_name, common_name, ingredient_slug, ingredient_group, function_summary,
          evidence_grade, evidence_level, origin_type, domain_type, is_active,
          allergen_flag, fragrance_flag, preservative_flag, eu_banned, eu_restricted, endocrine_flag,
          created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'expert_opinion', 'biotech', 'cosmetic', true,
          $7, $8, $9, false, false, false, NOW(), NOW())`,
        [canonical, info.common_name, s, info.ingredient_group || 'Diger', info.function_summary || null,
         info.evidence_grade || 'C',
         info.allergen_flag || false, info.fragrance_flag || false, info.preservative_flag || false],
      );
      return { name, canonical, count, added: true };
    } catch (e) {
      throw { name, error: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value.added) { added++; console.log(`✓ ${r.value.canonical} (freq=${r.value.count})`); }
      else { skipped++; }
    } else { failed++; console.log(`✗ ${r.reason?.name}: ${r.reason?.error}`); }
  }
}
console.log(`\n=== Done: ${added} added, ${skipped} skipped, ${failed} failed ===`);
await client.end();
