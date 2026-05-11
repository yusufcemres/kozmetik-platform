/**
 * FAZ 18 — Top trending INCI'ler icin SEO uzun-form makaleler.
 * content_articles tablosuna kaydeder.
 * Sonnet 4.5 ile her INCI icin 2000-3000 kelime: bilim + Turk pazar + ipuclari + SSS.
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

// Top trending INCI - sabit liste (SEO odakli)
const TARGETS = [
  { slug: 'niacinamide', title: 'Niasinamid: Cilt Bariyer Onarıcı Etkisi ve Doğru Kullanımı' },
  { slug: 'hyaluronic-acid', title: 'Hyaluronik Asit: Cilt Nemlendirme Mekanizması ve Etkili Konsantrasyon' },
  { slug: 'retinol', title: 'Retinol: Anti-Aging Yıldız Aktif, Tolerans ve Etkili Kullanım' },
  { slug: 'salicylic-acid', title: 'Salisilik Asit (BHA): Gözenek İçi Eksfoliasyon ve Akne Tedavisi' },
  { slug: 'centella-asiatica', title: 'Centella Asiatica (Cica): Cilt Yatıştırıcı ve Onarıcı Bitki' },
  { slug: 'panthenol', title: 'Panthenol (Provitamin B5): Cilt ve Saç İçin Onarıcı Etkisi' },
  { slug: 'glycerin', title: 'Gliserin: Cildin Doğal Nemlendiricisi ve Bariyer Destekçisi' },
  { slug: 'vitamin-c', title: 'Vitamin C (Ascorbik Asit): Aydınlatıcı Antioksidan Aktif' },
  { slug: 'tocopherol', title: 'Tocopherol (Vitamin E): Antioksidan Cilt Koruyucu' },
  { slug: 'sodium-hyaluronate', title: 'Sodyum Hyaluronat: HA\'nın Daha Stabil Versiyonu' },
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
- Yağlı / Kuru / Karma / Hassas / Olgun
- Spesifik öneriler

## Sık Yapılan Hatalar
4-6 madde. Örn. "Çok yüksek konsantrasyon", "yanlış kombinasyon"

## Türkiye Pazarındaki Örnek Ürünler
4-6 örnek ürün (jenerik, marka önermeden — "X marka serumu 10% niacinamid içerir")

## Sıkça Sorulan Sorular
5-7 SSS - cevap. SEO için "${slug} nedir", "${slug} ne işe yarar", "${slug} ile X karışır mı"

## Kaynaklar
5-8 kaynak (CIR, SCCS, PubMed, INCI Decoder, Cosmetics Info)

## REVELA Notu
Bilim-temelli özet 2-3 cumle.

Kurallar:
- Hallucinate yapma; emin değilsen genel ifade kullan
- Yazıma dikkat: Türkçe karakterler (ş ç ğ ı ö ü)
- Markdown ## başlık ile düzenli
- Sadece markdown döndür, başka açıklama yok`;

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

console.log(`=== Top INCI SEO Articles ===\n`);
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
