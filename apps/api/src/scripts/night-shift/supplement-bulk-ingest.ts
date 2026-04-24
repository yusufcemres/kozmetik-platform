/**
 * Supplement bulk ingestion pipeline — Orzax-first.
 *
 * Flow per raw Orzax JSON (from scan-orzax-site.ts):
 *   1. Tavily search: find Trendyol + Hepsiburada affiliate URL
 *   2. Claude Opus JSON-gen: extract structured ingredients from description + title
 *   3. Validate quality gates (image, form, ingredients, DV%, UL)
 *   4. Write to products-queue/<brand>/<product-slug>.json (ready-to-onboard)
 *
 * Runs once per input file; sprint orchestrator batches.
 *
 * Usage:
 *   ./run-prod.sh src/scripts/night-shift/supplement-bulk-ingest.ts --input=<raw-json-path> [--dry-run]
 *   ./run-prod.sh src/scripts/night-shift/supplement-bulk-ingest.ts --batch [--limit=N] [--skip-existing]
 *
 * Env:
 *   ANTHROPIC_API_KEY (required)
 *   TAVILY_API_KEY    (optional — fallback to orzax URL if missing)
 */
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from 'pg';

const ROOT = path.resolve(__dirname, '../../../../..');
const RAW_DIR = path.join(ROOT, 'night-shift/logs/supplement-sprint/orzax-raw');
const READY_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_ready');
const REJECTED_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_rejected');
const INGREDIENTS_CACHE = path.join(
  ROOT,
  'night-shift/logs/supplement-sprint/ready-ingredients.json',
);

const ANTHROPIC_MODEL = 'claude-opus-4-7';
const TAVILY_API = 'https://api.tavily.com/search';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ----------------------- Ingredient cache -----------------------
interface ReadyIngredient {
  slug: string;
  common: string;
  domain: string;
  grade: string | null;
  dose_min: string | null;
  dose_max: string | null;
  dose_unit: string | null;
  ul: string | null;
}
interface ReadyCache {
  ready_slugs: string[];
  ingredients: ReadyIngredient[];
}
function loadReadyCache(): ReadyCache {
  if (!fs.existsSync(INGREDIENTS_CACHE)) {
    throw new Error(`Ingredient cache missing: ${INGREDIENTS_CACHE}. Run list-ready-ingredients.ts first.`);
  }
  return JSON.parse(fs.readFileSync(INGREDIENTS_CACHE, 'utf8'));
}

// ----------------------- DB helpers -----------------------
async function getDbClient(): Promise<Client> {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function getCategories(db: Client): Promise<Array<{ slug: string; name: string }>> {
  const r = await db.query(
    `SELECT category_slug AS slug, category_name AS name
     FROM categories
     WHERE domain_type IN ('supplement','both')
        OR category_slug IN ('vitamin-mineral','omega-dha-epa','probiyotik','kolajen','herbal','sporcu','protein','uyku-stres','eklem-kemik','vitamin','mineral','takviye')
     ORDER BY category_name`,
  );
  return r.rows;
}

async function brandExists(db: Client, brandSlug: string): Promise<boolean> {
  const r = await db.query(`SELECT 1 FROM brands WHERE brand_slug=$1 LIMIT 1`, [brandSlug]);
  return r.rowCount != null && r.rowCount > 0;
}

async function productExists(db: Client, brandSlug: string, productName: string): Promise<boolean> {
  const r = await db.query(
    `SELECT 1 FROM products p
     JOIN brands b ON b.brand_id=p.brand_id
     WHERE b.brand_slug=$1 AND LOWER(p.product_name)=LOWER($2)
     LIMIT 1`,
    [brandSlug, productName],
  );
  return r.rowCount != null && r.rowCount > 0;
}

// ----------------------- Tavily search -----------------------
async function findAffiliateUrl(
  productName: string,
  brandHint: string,
): Promise<{ platform: string; url: string } | null> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return null;

  const queries = [
    `site:trendyol.com ${brandHint} ${productName}`,
    `site:hepsiburada.com ${brandHint} ${productName}`,
  ];
  for (const q of queries) {
    try {
      const res = await fetch(TAVILY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tavilyKey}`,
        },
        body: JSON.stringify({ query: q, max_results: 5, search_depth: 'basic' }),
      });
      if (!res.ok) continue;
      const data: any = await res.json();
      for (const r of data.results || []) {
        const u: string = r.url || '';
        if (/trendyol\.com\/[^/]+\/[^?]+-p-\d+/.test(u)) {
          return { platform: 'trendyol', url: u.split('?')[0] };
        }
        if (/hepsiburada\.com\/[^?]+-p-HB[A-Z0-9]+/.test(u)) {
          return { platform: 'hepsiburada', url: u.split('?')[0] };
        }
      }
    } catch (_e) {
      /* continue */
    }
    await sleep(500);
  }
  return null;
}

// ----------------------- Image validation -----------------------
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    return ct.startsWith('image/');
  } catch {
    return false;
  }
}

// ----------------------- Claude JSON-gen -----------------------
function buildSystemPrompt(ready: ReadyCache, categories: Array<{ slug: string; name: string }>) {
  const slugList = ready.ingredients
    .map((i) => {
      const dose = i.dose_min && i.dose_max ? ` dose=${i.dose_min}-${i.dose_max}${i.dose_unit || ''}` : '';
      const ul = i.ul ? ` UL=${i.ul}${i.dose_unit || ''}` : '';
      return `  ${i.slug} (${i.common}${dose}${ul})`;
    })
    .join('\n');
  const catList = categories.map((c) => `  ${c.slug} (${c.name})`).join('\n');
  return `Sen REVELA takviye ingest uzmanısın. Orzax'ın kendi web sitesinden toplanmış ham ürün verisinden, REVELA onboarding JSON'u üretiyorsun. **Hiçbir alanı boş bırakma.** Yetersiz veri varsa \`SKIP_PRODUCT\` döndür.

=== DB'de Hazır Ingredient Slug'ları (bunlardan seç) ===
${slugList}

=== DB'de Hazır Kategori Slug'ları ===
${catList}

=== Kurallar ===
1. \`product_name\`: Ham başlıkta "Ocean" / "Day2Day" / "Orzax" markası varsa koru. Doz/form varsa ekle (örn "Ocean Magnezyum Bisglisinat + P5P 30 Tablet").
2. \`brand_slug\`: "orzax" (tüm Ocean/Day2Day/İmunol/Proceive Orzax'a aittir).
3. \`category_slug\`: Kategori listesinden EN UYGUN olanı seç. Emin değilsen en genel takviye kategorisini kullan.
4. \`supplement_detail.form\`: STRICT map:
   - kapsül/kapsul → capsule
   - yumuşak jel/softjel → softgel
   - tablet → tablet
   - şurup/likit → liquid
   - toz → powder
   - gummy/jel → gummy
   - sprey → spray
   - damla → drop
   - saşe/sase → sachet
5. \`supplement_detail.serving_size\`: Porsiyon (kaç tablet/kapsül/saşe/ml). \`serving_unit\`: ilgili birim.
6. \`net_content_value\` + \`net_content_unit\`: Kutu içeriği (örn 30 tablet, 150 ml).
7. \`ingredients[]\`: Ham açıklamadan SAYISAL dozaj çıkart. **TÜM aktif maddeleri listele** (örn. "125 mg magnezyum ve 5 mg B6" → HER İKİSİ ayrı ingredient). Her madde için:
   - \`ingredient_slug\`: Hazır listeden seç. YOKSA \`ingredients_to_create\`'e ekle (evidence_grade + ≥1 NIH/PubMed citation + function_summary ≥80 char zorunlu).
   - \`amount_per_serving\`: Sayı (number, porsiyon başı).
   - \`unit\`: mg / mcg / g / IU / B_CFU (milyar cfu) / mL / µg.
   - \`daily_value_percentage\`: TR RDA'sına göre hesapla. (Referans: D3: 5 µg=100%DV, Magnezyum 375 mg=100%, B6 1.4 mg=100%, C 80 mg=100%, E 12 mg=100%, K 75 µg=100%, Zn 10 mg=100%, Fe 14 mg=100%, I 150 µg=100%, Se 55 µg=100%, B12 2.5 µg=100%, Folat 200 µg=100%, B1 1.1 mg=100%, B2 1.4 mg=100%, Niacin 16 mg=100%, B5 6 mg=100%, Biotin 50 µg=100%).
   - **TR RDA'sı OLMAYAN maddeler** (kolajen, omega/EPA/DHA/balık yağı, probiyotik, melatonin, ashwagandha, curcumin, CoQ10, ginkgo, maca, kreatin, whey, protein) için \`daily_value_percentage: 0\` yaz (null DEĞİL, 0 — "DV tanımı yok" demek).
   - **UL kontrolü:** Doz UL'i aşıyorsa (D3>4000IU, A>3000µg, B6>100mg, Zn>40mg, Fe>45mg), SKIP_PRODUCT.
8. \`affiliate_url\`: Input'ta verilmişse aynen kullan. Yoksa orzax.com.tr source_url.
9. \`image_url\`: Input'taki ilk valid görsel.
10. \`short_description\`: Türkçe 150-300 karakter, faktüel (pazarlama dili yasak). Örnek iyi: "Ocean Magnezyum Bisglisinat her 2 tablette 240 mg şelatlı magnezyum + 10 mg P5P B6 sağlar. GI tolerans yüksek, 30 tabletlik kutu."
11. Her \`ingredient_slug\` SADECE hazır listede varsa kullanılır. Yoksa \`ingredients_to_create\`'te TAM şema ile oluşturulmalı (effective_dose_min/max, ul_dose, evidence_grade A/B/C, ≥1 NIH_ODS veya PubMed citation).
12. Ürün bilgisi yetersizse (dozaj belirsiz, madde listesi çıkmıyor, form belirsiz) → \`{ "skip": true, "reason": "..." }\` döndür.

=== Çıktı Formatı (ZORUNLU) ===
SADECE şu JSON yapısını döndür, başka hiçbir metin YOK:

Başarı durumu:
{
  "skip": false,
  "product": {
    "product_name": "...",
    "brand_slug": "orzax",
    "category_slug": "...",
    "short_description": "...",
    "net_content_value": 30,
    "net_content_unit": "tablet",
    "target_audience": "adult",
    "supplement_detail": {
      "form": "tablet",
      "serving_size": 2,
      "serving_unit": "tablet",
      "certification": "GMP"
    },
    "ingredients": [
      { "ingredient_slug": "...", "amount_per_serving": 240, "unit": "mg", "daily_value_percentage": 64 }
    ],
    "affiliate_url": "...",
    "affiliate_platform": "trendyol",
    "image_url": "..."
  },
  "ingredients_to_create": [],
  "brand_to_create": {
    "brand_slug": "orzax",
    "brand_name": "Orzax",
    "country": "TR"
  }
}

=== \`ingredients_to_create\` ŞEMASI (KATI — alan adları DEĞİŞTİRİLEMEZ) ===
Her yeni ingredient için tam olarak şu alanlar kullanılmalı:
{
  "ingredient_slug": "saccharomyces-boulardii",      // kebab-case slug
  "inci_name": "Saccharomyces boulardii",            // Latince/INCI adı (NOT "ingredient_name"!)
  "common_name": "Saccharomyces Boulardii",          // TR adı (null değil, zorunlu)
  "domain_type": "supplement",                       // hep "supplement"
  "ingredient_group": "probiotic",                   // vitamin/mineral/amino_acid/probiotic/herbal/other
  "function_summary": "≥80 karakter Türkçe açıklama — sağlık fonksiyonu, etki mekanizması, kullanım alanı.",
  "evidence_grade": "A",                             // A/B/C, başka değer YASAK
  "evidence_citations": [                            // NOT "citations"! Tam adı "evidence_citations"
    {
      "source": "PubMed",                            // veya NIH_ODS / Examine / EFSA
      "url": "https://pubmed.ncbi.nlm.nih.gov/...",  // url VEYA pmid VEYA doi — en az biri
      "accessed": "2026-04-23"
    }
  ],
  "effective_dose_min": 2,                           // sayı (min günlük)
  "effective_dose_max": 10,                          // sayı (max günlük)
  "effective_dose_unit": "B_CFU",                    // NOT "dose_unit"! Tam adı "effective_dose_unit"
  "ul_dose": null,                                   // upper limit (yoksa null)
  "safety_class": "neutral"                          // neutral/beneficial/caution
}

**ÖNEMLİ ALAN ADLARI (yanlış yazarsan JSON reddedilir):**
- \`inci_name\` (ingredient_name DEĞİL)
- \`common_name\` (zorunlu, TR adı)
- \`evidence_citations\` (citations DEĞİL, dizi)
- \`effective_dose_unit\` (dose_unit DEĞİL)

Skip durumu:
{ "skip": true, "reason": "Açıklama" }`;
}

interface RawProduct {
  source_url: string;
  product_slug_orzax: string;
  raw_title: string;
  description_paragraphs: string[];
  form_hint: string | null;
  net_content_hint: string | null;
  directions: string | null;
  images: string[];
  category_series: string | null;
  certifications: string[];
}

function buildUserPrompt(
  raw: RawProduct,
  affiliate: { platform: string; url: string } | null,
): string {
  const affiliateLine = affiliate
    ? `affiliate_url (cross-referenced): ${affiliate.url} (platform: ${affiliate.platform})`
    : `affiliate_url: ${raw.source_url} (orzax site — no affiliate match found)`;
  return `=== Orzax Raw Product ===
Başlık: ${raw.raw_title}
Kategori serisi: ${raw.category_series || '<yok>'}
Form ipucu: ${raw.form_hint || '<yok>'}
Net içerik ipucu: ${raw.net_content_hint || '<yok>'}
Sertifikalar: ${(raw.certifications || []).join(', ') || '<yok>'}
Kullanım: ${raw.directions || '<yok>'}

Açıklama paragrafları:
${raw.description_paragraphs.map((p, i) => `[${i + 1}] ${p}`).join('\n')}

Görseller: ${raw.images.slice(0, 3).join(' , ')}
${affiliateLine}

=== GÖREV ===
Bu ürünü REVELA onboarding JSON'una çevir. Her alan dolu olmalı. Ingredients'ı açıklamadan parse et. DV% hesapla. UL kontrolü yap. Çıktıyı SADECE JSON olarak ver.`;
}

async function claudeJsonGen(
  anthropic: Anthropic,
  systemPrompt: string,
  userPrompt: string,
): Promise<any> {
  const res = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const text = res.content
    .filter((c: any) => c.type === 'text')
    .map((c: any) => c.text)
    .join('\n');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in Claude response. Text: ${text.slice(0, 300)}`);
  return JSON.parse(jsonMatch[0]);
}

// ----------------------- Normalize Claude output (tolerate schema drift) -----------------------
function normalizeDoc(doc: any): void {
  if (!doc?.ingredients_to_create) return;
  for (const it of doc.ingredients_to_create) {
    // ingredient_name → inci_name
    if (!it.inci_name && it.ingredient_name) {
      it.inci_name = it.ingredient_name;
      delete it.ingredient_name;
    }
    // auto-fill common_name from inci_name if missing
    if (!it.common_name && it.inci_name) {
      it.common_name = it.inci_name;
    }
    // citations → evidence_citations
    if (!it.evidence_citations && it.citations) {
      it.evidence_citations = it.citations;
      delete it.citations;
    }
    // dose_unit → effective_dose_unit
    if (!it.effective_dose_unit && it.dose_unit) {
      it.effective_dose_unit = it.dose_unit;
      delete it.dose_unit;
    }
    // ingredient_type → ingredient_group
    if (!it.ingredient_group && it.ingredient_type) {
      it.ingredient_group = it.ingredient_type;
      delete it.ingredient_type;
    }
    if (!it.domain_type) it.domain_type = 'supplement';
    // citations entries: title → ignore, source + url preserved
  }
}

// ----------------------- Quality gate -----------------------
function qualityGate(doc: any, ready: ReadyCache): { ok: boolean; reason: string | null } {
  if (doc.skip) return { ok: false, reason: `claude-skip: ${doc.reason}` };
  const p = doc.product;
  if (!p) return { ok: false, reason: 'missing product' };
  if (!p.product_name) return { ok: false, reason: 'missing product_name' };
  if (!p.brand_slug) return { ok: false, reason: 'missing brand_slug' };
  if (!p.category_slug) return { ok: false, reason: 'missing category_slug' };
  if (!p.supplement_detail?.form)
    return { ok: false, reason: 'missing supplement_detail.form' };
  if (!p.image_url) return { ok: false, reason: 'missing image_url' };
  if (!p.affiliate_url) return { ok: false, reason: 'missing affiliate_url' };
  if (!Array.isArray(p.ingredients) || p.ingredients.length === 0)
    return { ok: false, reason: 'no ingredients' };
  const readySlugs = new Set(ready.ready_slugs);
  const toCreate = new Set((doc.ingredients_to_create || []).map((x: any) => x.ingredient_slug));
  for (const ing of p.ingredients) {
    if (!ing.ingredient_slug) return { ok: false, reason: 'ingredient without slug' };
    if (ing.amount_per_serving == null) return { ok: false, reason: `${ing.ingredient_slug}: no amount` };
    if (!ing.unit) return { ok: false, reason: `${ing.ingredient_slug}: no unit` };
    if (ing.daily_value_percentage == null) {
      // Auto-fill 0 for non-essential (no TR RDA): collagen, omega, probiotics, herbs, etc.
      const noRdaPatterns = /collagen|protein|whey|fish-oil|omega|epa|dha|flaxseed|probiotic|lactobacillus|bifidobacterium|melatonin|ashwagandha|curcumin|curcuma|ginkgo|maca|coenzyme|creatine|hyaluron|glucosamine|chondroitin|quercetin|resveratrol|berberine|spirulina|chlorella|ginseng|rhodiola|echinacea/i;
      if (noRdaPatterns.test(ing.ingredient_slug)) {
        ing.daily_value_percentage = 0;
      } else {
        return { ok: false, reason: `${ing.ingredient_slug}: no DV%` };
      }
    }
    if (!readySlugs.has(ing.ingredient_slug) && !toCreate.has(ing.ingredient_slug)) {
      return {
        ok: false,
        reason: `${ing.ingredient_slug}: not in ready list and not in ingredients_to_create`,
      };
    }
  }
  // Validate ingredients_to_create entries
  for (const it of doc.ingredients_to_create || []) {
    if (!it.ingredient_slug || !it.inci_name)
      return { ok: false, reason: `ingredients_to_create: missing slug/inci` };
    if (!it.evidence_grade || !['A', 'B', 'C'].includes(it.evidence_grade))
      return { ok: false, reason: `${it.ingredient_slug}: evidence_grade must be A/B/C` };
    if (
      !Array.isArray(it.evidence_citations) ||
      it.evidence_citations.length === 0 ||
      !it.evidence_citations[0]?.url
    )
      return { ok: false, reason: `${it.ingredient_slug}: missing evidence_citations with URL` };
    if (!it.function_summary || it.function_summary.length < 80)
      return {
        ok: false,
        reason: `${it.ingredient_slug}: function_summary must be ≥80 chars`,
      };
  }
  return { ok: true, reason: null };
}

// ----------------------- Main -----------------------
async function processOne(
  anthropic: Anthropic,
  rawPath: string,
  ready: ReadyCache,
  categories: Array<{ slug: string; name: string }>,
  db: Client,
): Promise<'ready' | 'rejected' | 'duplicate'> {
  const raw: RawProduct = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const slug = raw.product_slug_orzax;

  // Dedupe check
  const existingBrand = await brandExists(db, 'orzax');
  if (existingBrand) {
    // Check if a product with similar name already exists
    // (loose match — Claude will produce full name, we check that later too)
    const nameHint = raw.raw_title;
    const dup = await productExists(db, 'orzax', nameHint);
    if (dup) {
      console.log(`    DUP: ${slug} (brand orzax + name ${nameHint})`);
      return 'duplicate';
    }
  }

  // 1. Image validation
  let validImage: string | null = null;
  for (const img of raw.images) {
    if (await validateImageUrl(img)) {
      validImage = img;
      break;
    }
  }
  if (!validImage) {
    console.log(`    REJ ${slug}: no valid image`);
    fs.mkdirSync(REJECTED_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(REJECTED_DIR, `${slug}.reason.txt`),
      `no valid image — tried: ${raw.images.join(', ')}`,
    );
    return 'rejected';
  }
  raw.images = [validImage];

  // 2. Affiliate cross-reference
  const affiliate = await findAffiliateUrl(raw.raw_title, 'orzax ocean day2day');

  // 3. Claude JSON-gen
  const systemPrompt = buildSystemPrompt(ready, categories);
  const userPrompt = buildUserPrompt(raw, affiliate);
  let doc;
  try {
    doc = await claudeJsonGen(anthropic, systemPrompt, userPrompt);
    normalizeDoc(doc);
    // Override image_url & affiliate_url with validated picks
    if (doc.product) {
      doc.product.image_url = validImage;
      if (affiliate) {
        doc.product.affiliate_url = affiliate.url;
        doc.product.affiliate_platform = affiliate.platform;
      } else if (!doc.product.affiliate_url) {
        doc.product.affiliate_url = raw.source_url;
        doc.product.affiliate_platform = 'orzax';
      }
    }
  } catch (e: any) {
    console.log(`    REJ ${slug}: claude fail — ${e?.message?.slice(0, 120)}`);
    fs.mkdirSync(REJECTED_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(REJECTED_DIR, `${slug}.reason.txt`),
      `claude error: ${e?.message}`,
    );
    return 'rejected';
  }

  // 4. Quality gate
  const gate = qualityGate(doc, ready);
  if (!gate.ok) {
    console.log(`    REJ ${slug}: ${gate.reason}`);
    fs.mkdirSync(REJECTED_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(REJECTED_DIR, `${slug}.json`),
      JSON.stringify({ reason: gate.reason, doc }, null, 2),
    );
    return 'rejected';
  }

  // 5. Check post-gate name dup
  const nameDup = await productExists(db, doc.product.brand_slug || 'orzax', doc.product.product_name);
  if (nameDup) {
    console.log(`    DUP: ${doc.product.product_name}`);
    return 'duplicate';
  }

  // 6. Write ready JSON
  fs.mkdirSync(READY_DIR, { recursive: true });
  const outPath = path.join(READY_DIR, `orzax-${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
  console.log(`    OK  ${slug} → ${outPath}`);
  return 'ready';
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args.find((a) => a.startsWith('--input='));
  const batch = args.includes('--batch');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const skipExisting = args.includes('--skip-existing');
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY env not set');
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const ready = loadReadyCache();
  const db = await getDbClient();
  const categories = await getCategories(db);
  console.log(`[ingest] ${ready.ready_slugs.length} ready slugs, ${categories.length} categories`);

  let rawFiles: string[] = [];
  if (inputArg) {
    rawFiles = [inputArg.split('=')[1]];
  } else if (batch) {
    rawFiles = fs
      .readdirSync(RAW_DIR)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      .map((f) => path.join(RAW_DIR, f));
    if (limit > 0) rawFiles = rawFiles.slice(0, limit);
  } else {
    throw new Error('Either --input=<path> or --batch required');
  }

  const counts = { ready: 0, rejected: 0, duplicate: 0 };
  for (let i = 0; i < rawFiles.length; i++) {
    const rp = rawFiles[i];
    const slug = path.basename(rp, '.json');
    const readyPath = path.join(READY_DIR, `orzax-${slug}.json`);
    const rejPath = path.join(REJECTED_DIR, `${slug}.reason.txt`);
    if (skipExisting && (fs.existsSync(readyPath) || fs.existsSync(rejPath))) {
      console.log(`  [${i + 1}/${rawFiles.length}] SKIP (already processed): ${slug}`);
      continue;
    }
    console.log(`  [${i + 1}/${rawFiles.length}] PROCESS: ${slug}`);
    try {
      const result = await processOne(anthropic, rp, ready, categories, db);
      counts[result]++;
    } catch (e: any) {
      counts.rejected++;
      console.log(`    REJ ${slug}: fatal — ${e?.message}`);
      fs.mkdirSync(REJECTED_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(REJECTED_DIR, `${slug}.fatal.txt`),
        `fatal: ${e?.message}\n${e?.stack}`,
      );
    }
    await sleep(800); // rate-limit safety
  }

  await db.end();
  console.log('');
  console.log(`[ingest] DONE: ${counts.ready} ready, ${counts.rejected} rejected, ${counts.duplicate} duplicate`);

  const summary = {
    ...counts,
    finished_at: new Date().toISOString(),
    ready_dir: READY_DIR,
    rejected_dir: REJECTED_DIR,
  };
  fs.mkdirSync(path.join(ROOT, 'night-shift/logs/supplement-sprint'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, 'night-shift/logs/supplement-sprint/ingest-summary.json'),
    JSON.stringify(summary, null, 2),
  );
}

main().catch((e) => {
  console.error('[ingest] FATAL:', e);
  process.exit(1);
});
