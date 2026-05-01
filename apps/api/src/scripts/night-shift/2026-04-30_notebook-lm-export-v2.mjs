// NotebookLM v2 — Sponsorlu açılış + kapanış jingle metne yedirilmiş
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

const outDir = resolve(__dirname, '../../../../../podcast-pilot/v2');
try { mkdirSync(outDir, { recursive: true }); } catch {}

function buildIntro(title) {
  return `## 🎙️ PODCAST AÇILIŞ — REVELA Sponsorlu Bölüm Girişi

**(Bu bölümü iki sunucu, sohbetin EN BAŞINDA, kaynak özetinden ÖNCE seslendirir. Net, samimi, fonda hafif jingle.)**

> **Sunucu A:** "Merhaba, REVELA Podcast'e hoş geldiniz — kozmetik ve takviye içeriklerinin bilimini Türkçe konuşan podcast."
>
> **Sunucu B:** "Ben [B], yanımda [A]. Bu bölümün konusu: ${title}."
>
> **Sunucu A:** "Bu bölüm REVELA tarafından sunuluyor. REVELA, Türkiye'deki 1.795 yayın ürünü — 1.568 kozmetik ve 227 takviye — yedi boyutlu bilimsel skorla analiz eden bağımsız platform. Kullanılan dört yüz yetmiş beş INCI bileşeninin tamamında Türkçe karşılık, yüzde doksan beşinde A-E kanıt derecelendirmesi ve literatür atıfı var."
>
> **Sunucu B:** "Markaların değil, formüllerin konuştuğu yer: **kozmetik-platform.vercel.app**. Şimdi konuya girelim."

---

`;
}

function buildOutro() {
  return `

---

## 🎙️ PODCAST KAPANIŞ — REVELA Outro

**(Bu bölümü iki sunucu, sohbetin EN SONUNDA, içerik özetinden SONRA seslendirir. Yumuşak geçişle, hafif fade.)**

> **Sunucu B:** "Bugünkü bölümümüz burada bitiyor."
>
> **Sunucu A:** "Bu konuyla ilgili her bir INCI bileşenini, REVELA Skorunu, kişisel uyumluluğunuzu — hepsini tek yerde görebilirsiniz."
>
> **Sunucu B:** "**REVELA — kozmetik-platform.vercel.app**. Bilimsel kozmetik analizinde Türkçe rehberiniz."
>
> **Sunucu A:** "Bir sonraki bölümde yeni bir konuyla buluşmak üzere — sağlıkla kalın."

`;
}

const PRODUCTION_NOTE = `

---

## 🎚️ NotebookLM Üretim Talimatı

- **Uzunluk:** **KISA** seçin (Varsayılan 18-22 dk üretiyor — Kısa 10-13 dk)
- **Biçim:** Ayrıntılı inceleme
- **Dil:** Türkçe
- **Hedef süre:** 10-15 dk
- **Hedef ton:** samimi-bilimsel, abla-arkadaş gibi açıklayıcı
- **Marka tanıtımı:** Yukarıdaki AÇILIŞ ve KAPANIŞ blokları bölümün başına ve sonuna yedirilmeli — sponsorlu segment formatı
`;

for (const slug of PILOT_SLUGS) {
  const r = await c.query(
    `SELECT title, summary, body_markdown FROM content_articles WHERE slug = $1`,
    [slug]
  );
  if (!r.rows.length) continue;
  const a = r.rows[0];

  const podcastReady = `# ${a.title}

${buildIntro(a.title)}

## ASIL İÇERİK

**Bölüm Özeti:** ${a.summary}

${a.body_markdown}

${buildOutro()}

${PRODUCTION_NOTE}`;

  writeFileSync(resolve(outDir, `${slug}.md`), podcastReady);
  console.log(`✓ v2/${slug}.md (${podcastReady.length} char)`);
}

console.log(`\nÇıktı: ${outDir}`);

await c.end();
