/**
 * FAZ 22 — Ikinci tur 10 SEO INCI makalesi.
 * FAZ 18'in devamı: bir sonraki dalga trending INCI'ler.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const PARALLEL = 2;

const TARGETS = [
  { slug: 'azelaic-acid', title: 'Azelaik Asit: Rozasea, Akne ve Hiperpigmentasyon Üçlüsü İçin' },
  { slug: 'bakuchiol', title: 'Bakuchiol: Retinolün Bitkisel Alternatifi mi?' },
  { slug: 'allantoin', title: 'Allantoin: Cilt Yatıştırıcı ve Bariyer Onarıcı Aktif' },
  { slug: 'squalane', title: 'Skualan: Cilt Bariyerini Onaran Hafif Yağ' },
  { slug: 'ceramides', title: 'Seramidler: Cilt Bariyerinin Yapı Taşı' },
  { slug: 'peptides', title: 'Peptitler: Anti-Aging Bilimi ve Cilt Onarımı' },
  { slug: 'glycolic-acid', title: 'Glikolik Asit (AHA): En Etkili Eksfoliyant Aktif' },
  { slug: 'lactic-acid', title: 'Laktik Asit: Hassas Cilt İçin Yumuşak Eksfoliyant' },
  { slug: 'mandelic-acid', title: 'Mandelik Asit: Koyu Tenler İçin Güvenli AHA' },
  { slug: 'arbutin', title: 'Arbutin: Aydınlatıcı Cilt İçin Hidrokinon Alternatifi' },
];

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function generateArticle(slug, title) {
  const prompt = `Sen REVELA platformu icin bilim-temelli, atıflı kozmetik içeriği yazan uzman editorsun.

Makale konusu: "${title}"
INCI slug: ${slug}

2500-3500 kelime Turkce, SEO-uyumlu blog makale yaz. Markdown format. Su bolumler:

# ${title}

## Özet (TL;DR) — 3-5 madde

## ${title.split(':')[0]} Nedir?
2-3 paragraf. Molekuler yapı, sınıf, dogal kaynak.

## Cilt Üzerindeki Etki Mekanizması
3-4 paragraf. Hücresel düzeyde. Pathway, enzim, reseptör. Bilimsel jargon ama anlaşılır.

## Etkili Konsantrasyon ve Kullanım
- Konsantrasyon aralığı
- pH gereksinimi
- Kombinasyon kuralları
- Hangi sürede etki

## Klinik Kanıtlar
3-5 RCT/sistematik derleme atıfı (yazar+yıl+dergi). Spesifik sonuc/yuzdeler.

## Hangi Cilt Tipine Uygun

## Sık Yapılan Hatalar
4-6 madde

## Türkiye Pazarındaki Örnek Ürünler
4-6 örnek ürün (jenerik, marka önermeden)

## Sıkça Sorulan Sorular
5-7 SSS

## Kaynaklar
5-8 kaynak (CIR, SCCS, PubMed, INCI Decoder)

## REVELA Notu
2-3 cumle.

Kurallar:
- Hallucinate yapma
- Türkçe karakterler (ş ç ğ ı ö ü)
- Markdown ## başlık
- Sadece markdown döndür, açıklama yok`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const d = await r.json();
  return d.content[0].text;
}

await client.connect();

console.log(`=== Batch 2 SEO Articles ===\n`);
let success = 0, failed = 0;

for (let i = 0; i < TARGETS.length; i += PARALLEL) {
  const chunk = TARGETS.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (t) => {
    try {
      const articleSlug = `inci-${t.slug}`;
      const existsCheck = await client.query(`SELECT article_id FROM content_articles WHERE slug=$1 LIMIT 1`, [articleSlug]);
      if (existsCheck.rows.length > 0) return { slug: t.slug, skipped: true };
      const md = await generateArticle(t.slug, t.title);
      await client.query(
        `INSERT INTO content_articles (slug, title, summary, body_markdown, status, published_at, created_at, updated_at, content_type)
         VALUES ($1, $2, $3, $4, 'published', NOW(), NOW(), NOW(), 'ingredient_guide')`,
        [articleSlug, t.title, `Bilim-temelli ${t.slug} rehberi — REVELA editor`, md],
      );
      return { slug: t.slug, len: md.length };
    } catch (e) {
      throw { slug: t.slug, error: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value.skipped) console.log(`⊘ ${r.value.slug} (already exists)`);
      else { success++; console.log(`✓ ${r.value.slug} (${r.value.len} chars)`); }
    } else { failed++; console.log(`✗ ${r.reason?.slug}: ${r.reason?.error}`); }
  }
}
console.log(`\n=== Done: ${success} articles, ${failed} failed ===`);
await client.end();
