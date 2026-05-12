/**
 * FAZ 23 — Description'siz veya cok kisa olan tum aktif markalara AI ile
 * description + tagline + founded_year + ulke + signature_categories ekle.
 * v1'in (sadece son 24 saat) genisletilmis hali.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const PARALLEL = 4;

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function generateBrandInfo(brandName, sampleProducts) {
  const sample = (sampleProducts || []).slice(0, 5).map((p) => p.product_name).filter(Boolean).join(', ');
  const prompt = `Sen kozmetik / dermokozmetik / kişisel bakım marka analisti uzmanısın.

Marka: "${brandName}"
${sample ? `Bu markanın bazı ürünleri: ${sample}` : ''}

Bu marka hakkında JSON formatında bilgi döndür. SADECE JSON, başka metin yok:

{
  "brand_description": "2-3 cumle Turkce aciklama. Kurulus yili, menşei, uzmanlik alanlari, marka pozisyonu (mass-market/premium/aptek/eczane vb). Eger marka tanidik degilse 'Bu marka hakkinda dogrulanmis bilgi bulunamadi' yaz.",
  "tagline": "Tek cumle Turkce slogan veya null",
  "founded_year": tahmini yil (yyyy) veya null,
  "country_of_origin": "ISO-2 kod (TR, FR, US, KR, DE, vb.) veya null",
  "signature_categories": ["kategori1", "kategori2"] (en fazla 4, kucuk harf Turkce)
}

Eger marka tanidik degilse founded_year, country_of_origin null birak.
Hallucinate yapma. Dogru bilmediginde null koy.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}`);
  const data = await response.json();
  const text = data.content[0].text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[1]);
}

await client.connect();

const { rows: targets } = await client.query(`
  SELECT b.brand_id, b.brand_name,
    (SELECT json_agg(json_build_object('product_name', p.product_name)) FROM (SELECT product_name FROM products WHERE brand_id=b.brand_id LIMIT 5) p) AS sample
  FROM brands b
  WHERE b.is_active = true
    AND (b.brand_description IS NULL OR LENGTH(b.brand_description) < 100)
  ORDER BY b.brand_id DESC
`);
console.log(`Target brands: ${targets.length}\n`);

let success = 0, failed = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (b) => {
    try {
      const info = await generateBrandInfo(b.brand_name, b.sample || []);
      await client.query(
        `UPDATE brands SET brand_description = $1, tagline = $2, founded_year = $3, country_of_origin = $4, signature_categories = $5, updated_at = NOW() WHERE brand_id = $6`,
        [
          info.brand_description || null,
          info.tagline || null,
          info.founded_year || null,
          info.country_of_origin || null,
          info.signature_categories || [],
          b.brand_id,
        ],
      );
      return { id: b.brand_id, name: b.brand_name };
    } catch (e) {
      throw { id: b.brand_id, name: b.brand_name, error: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled') { success++; console.log(`✓ #${r.value.id} ${r.value.name}`); }
    else { failed++; console.log(`✗ #${r.reason?.id} ${r.reason?.name}: ${r.reason?.error}`); }
  }
}
console.log(`\n=== Done: ${success} ok, ${failed} fail ===`);
await client.end();
