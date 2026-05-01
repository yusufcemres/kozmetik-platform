// NotebookLM pilot için 3 makale metnini dışa aktar (kopyala-yapıştır hazır)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const PILOT_SLUGS = [
  '2026-04-30-lekek-tedavi-arbutin-kojik-tranexamic',
  '2026-04-30-skin-cycling-4-gun-protokol',
  '2026-04-30-cilt-mikrobiyomu-probiyotik',
];

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const outDir = resolve(__dirname, '../../../../../podcast-pilot');
try { mkdirSync(outDir, { recursive: true }); } catch {}

for (const slug of PILOT_SLUGS) {
  const r = await c.query(
    `SELECT title, summary, body_markdown, content_type FROM content_articles WHERE slug = $1`,
    [slug]
  );
  if (!r.rows.length) { console.log(`✗ ${slug} bulunamadı`); continue; }

  const a = r.rows[0];
  const podcastReady = `# ${a.title}

## Bölüm Özeti (Podcast Aday Kısa Tanım)

${a.summary}

---

${a.body_markdown}

---

## NotebookLM Üretim Notu (Audio Overview için)

- **Hedef ses formatı:** İki AI host sohbeti, eğitici-samimi ton
- **Hedef süre:** 8-12 dakika
- **Türkçe:** Audio Overview Türkçe destekli
- **Hedef kitle:** REVELA kullanıcısı (kozmetik bilinçli, bilim-temelli yaklaşım arayan)
- **REVELA bağlamı:** Bu makale REVELA platformunda yayında. Skorlama metodolojisi 7-boyut + floor cap. Kullanılan tüm INCI'lerde Türkçe karşılık + kanıt derecelendirmesi (A-E) + literatür atıfı mevcut.
- **CTA:** "Bu konunun ürün önerilerini REVELA'da görebilirsin: kozmetik-platform.vercel.app"`;

  const filename = `${slug}.md`;
  writeFileSync(resolve(outDir, filename), podcastReady);
  console.log(`✓ ${filename} (${podcastReady.length} char) yazıldı`);
}

console.log(`\nÇıktı: ${outDir}`);
console.log(`Kullanım: NotebookLM'de "Yeni notebook" → "Kaynak ekle" → .md dosyalarını yükle veya içeriği yapıştır`);

await c.end();
