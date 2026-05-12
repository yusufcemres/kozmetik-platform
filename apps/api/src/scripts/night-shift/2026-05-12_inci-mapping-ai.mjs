/**
 * FAZ 7 — Top 500 INCI'da mapping-siz olanlar icin AI mapping suggestions.
 * Auto-apply YOK — ingredient_need_mapping_proposals tablosuna pending olarak yazar.
 * Admin /admin/inci-mapping-proposals'ta onaylar.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const PARALLEL = 3;

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function generateMappingsFor(inci, needList) {
  const needsTable = needList.map((n) => `- ${n.need_id}: ${n.need_name} (${n.need_slug})`).join('\n');
  const prompt = `Sen kozmetik / dermatoloji uzmanı kimyagersin.

INCI: "${inci.inci_name}"
Türkçe ad: ${inci.common_name || '-'}
Fonksiyon: ${inci.function_summary || '-'}
Evidence grade: ${inci.evidence_grade || '-'}

REVELA "need" (ihtiyaç) listesi:
${needsTable}

Bu INCI hangi need'lere uygun? Mevcut RCT/sistematik derleme kanıtına dayanarak öneri yap.

JSON formatı (SADECE JSON):
[
  {
    "need_id": <need ID>,
    "relevance_score": 0-100 arası,
    "effect_type": "direct_support" | "complementary" | "neutral" | "contraindicated",
    "evidence_level": "A" | "B" | "C",
    "ai_reasoning": "Kısa atıflı gerekçe (1-2 cümle)"
  }
]

Kurallar:
- En fazla 5 öneri (en güçlü kanıtlı 5)
- relevance_score >=40 olanları yaz, daha düşükse listeden çıkar
- evidence_level: A=RCT/sistematik, B=klinik/kohort, C=uzman görüşü
- direct_support: ana mekanizma; complementary: destek; neutral: zayıf ilgili; contraindicated: kontrendike
- Eğer hiç need'le güçlü ilgisi yoksa boş array [] dön
- Hallucinate yapma, kesinlik gerekiyor

Sadece JSON döndür.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const d = await r.json();
  const text = d.content[0].text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[1]);
}

await client.connect();

const needs = (await client.query(`SELECT need_id, need_name, need_slug FROM needs WHERE is_active=true ORDER BY need_id`)).rows;
console.log(`${needs.length} need available\n`);

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '500');
const { rows: targets } = await client.query(`
  WITH top_inci AS (
    SELECT i.ingredient_id, i.inci_name, i.common_name, i.function_summary, i.evidence_grade,
      (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id) AS usage
    FROM ingredients i WHERE i.is_active = true
    ORDER BY usage DESC LIMIT $1
  )
  SELECT * FROM top_inci ti
  WHERE NOT EXISTS (SELECT 1 FROM ingredient_need_mappings m WHERE m.ingredient_id=ti.ingredient_id)
    AND NOT EXISTS (SELECT 1 FROM ingredient_need_mapping_proposals p WHERE p.ingredient_id=ti.ingredient_id)
  ORDER BY usage DESC
`, [LIMIT]);
console.log(`Targets: ${targets.length}\n`);

let success = 0, failed = 0, totalProposals = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (inci) => {
    try {
      const mappings = await generateMappingsFor(inci, needs);
      let inserted = 0;
      for (const m of mappings) {
        if (!m.need_id || !m.relevance_score) continue;
        try {
          await client.query(
            `INSERT INTO ingredient_need_mapping_proposals (ingredient_id, need_id, relevance_score, effect_type, evidence_level, ai_reasoning)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (ingredient_id, need_id) DO NOTHING`,
            [inci.ingredient_id, m.need_id, m.relevance_score, m.effect_type || 'complementary', m.evidence_level || 'C', m.ai_reasoning || null],
          );
          inserted++;
        } catch {}
      }
      return { name: inci.inci_name, count: inserted };
    } catch (e) {
      throw { name: inci.inci_name, error: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled') {
      success++; totalProposals += r.value.count;
      console.log(`✓ ${r.value.name}: ${r.value.count} proposals`);
    } else { failed++; console.log(`✗ ${r.reason?.name}: ${r.reason?.error}`); }
  }
}
console.log(`\n=== Done: ${success} INCI scored, ${failed} fail, ${totalProposals} mapping proposals queued ===`);
await client.end();
