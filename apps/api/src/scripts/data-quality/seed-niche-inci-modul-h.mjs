/**
 * Modül H — 20 niche INCI veritabanı genişletme.
 *
 * Kaynak:
 *  - Quantum Orbit Labs 8 serum INCI listesi (memory'de proje kararı)
 *  - REVELA niche skin-care literatür (peptit + bitki ekstresi + C vit derivatives)
 *
 * Her INCI için:
 *  - domain_type=cosmetic
 *  - inci_name + common_name + slug + group
 *  - function_summary (TR, min 80 char)
 *  - evidence_grade A-E
 *  - safety_class beneficial|neutral|questionable
 *  - efficacy_conc_min/max (varsa)
 *  - origin_type
 *  - evidence_citations[] (en az 1)
 *
 * Idempotent: ingredient_slug UNIQUE → ON CONFLICT DO NOTHING.
 *
 * Kullanım:
 *   node src/scripts/data-quality/seed-niche-inci-modul-h.mjs            # dry-run
 *   node src/scripts/data-quality/seed-niche-inci-modul-h.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const INGREDIENTS = [
  // ── PEPTİTLER (cilt hücre sinyalizasyonu) ──────────────────────────
  {
    inci_name: 'Hexapeptide-9',
    common_name: 'Heksapeptid-9',
    slug: 'hexapeptide-9',
    group: 'peptide',
    origin: 'biotechnology',
    function_summary: 'Sentetik altı amino asitli peptit. Bazal membran proteinlerinin (kolajen IV, laminin-5) sentezini destekleyerek cilt sıkılığı ve elastikiyetini artırır.',
    evidence_grade: 'C',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.05,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'In vitro', title: 'Hexapeptide-9 basement membrane synthesis', year: 2018 },
    ],
  },
  {
    inci_name: 'Acetyl Hexapeptide-8',
    common_name: 'Argireline (Asetil Heksapeptid-8)',
    slug: 'acetyl-hexapeptide-8',
    group: 'peptide',
    origin: 'biotechnology',
    function_summary: 'SNAP-25 proteinine bağlanarak yüz kaslarının kasılma sinyalini azaltır. Anlık mimik kırışıklıklarında "botoks-benzeri" yüzeysel etki sağlar.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 5.0,
    efficacy_conc_max: 10.0,
    citations: [
      { source: 'PubMed', pmid: '23377217', title: 'Argireline anti-wrinkle efficacy clinical trial', year: 2013 },
    ],
  },
  {
    inci_name: 'Polylysine',
    common_name: 'Polilizin',
    slug: 'polylysine',
    group: 'peptide',
    origin: 'biotechnology',
    function_summary: 'Doğal antimikrobiyal polipeptit. Kozmetik formülasyonlarda preservatif sistemi destekleyici olarak kullanılır, doğal alternatif.',
    evidence_grade: 'C',
    safety_class: 'neutral',
    preservative: true,
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 0.5,
    citations: [
      { source: 'CIR', title: 'Polylysine cosmetic safety assessment', year: 2019 },
    ],
  },

  // ── C VİTAMİNİ TÜREVLERİ ───────────────────────────────────────────
  {
    inci_name: '3-O-Ethyl Ascorbic Acid',
    common_name: 'Etil Askorbik Asit (Stabil C Vitamini)',
    slug: 'ethyl-ascorbic-acid',
    group: 'antioxidant',
    origin: 'synthetic',
    function_summary: 'Suda ve yağda çözünebilen stabil C vitamini formu. L-askorbik asit gibi kolajen sentezini tetikler ama pH 5-7\'de okside olmaz. Pigment dengeleyici.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 1.0,
    efficacy_conc_max: 10.0,
    citations: [
      { source: 'PubMed', pmid: '32034861', title: 'Ethyl ascorbic acid skin permeation', year: 2020 },
    ],
  },
  {
    inci_name: 'Tetrahexyldecyl Ascorbate',
    common_name: 'Tetraheksildesil Askorbat (Yağ-çözünür C)',
    slug: 'tetrahexyldecyl-ascorbate',
    group: 'antioxidant',
    origin: 'synthetic',
    function_summary: 'Yağ-çözünür C vitamini ester formu. Hücre zarından geçişi yüksek, fibroblast kolajen sentezini in vitro %50\'ye kadar artırır. Stabil.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 10.0,
    citations: [
      { source: 'PubMed', pmid: '24410838', title: 'THD ascorbate fibroblast collagen synthesis', year: 2014 },
    ],
  },

  // ── BİTKİSEL ANTİOKSİDAN/AKTIVELER ─────────────────────────────────
  {
    inci_name: 'Salix Purpurea Bark Extract',
    common_name: 'Mor Söğüt Kabuğu Ekstresi (Doğal Salisilik Asit)',
    slug: 'salix-purpurea-extract',
    group: 'active',
    origin: 'natural',
    function_summary: 'Doğal salisin içeren söğüt kabuğu ekstresi. Cilt yüzeyinde hafif kimyasal eksfoliyasyon ve yağ dengesi sağlar. BHA alternatifi.',
    evidence_grade: 'C',
    safety_class: 'neutral',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'CIR', title: 'Salix bark extract safety review', year: 2017 },
    ],
  },
  {
    inci_name: 'Trifolium Pratense Flower Extract',
    common_name: 'Kırmızı Yonca Çiçek Ekstresi (Fitoöstrojen)',
    slug: 'trifolium-pratense-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'İzoflavon (biokanin A, formononetin) içeren fitoöstrojen kaynağı. Menopoz sonrası ciltte kolajen kaybını yavaşlatıcı destek olarak kullanılır.',
    evidence_grade: 'C',
    safety_class: 'neutral',
    efficacy_conc_min: 1.0,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'PubMed', pmid: '17628176', title: 'Red clover isoflavones skin aging', year: 2007 },
    ],
  },
  {
    inci_name: 'Microcitrus Australasica Fruit Extract',
    common_name: 'Finger Lime / Caviar Lime Meyve Ekstresi',
    slug: 'microcitrus-australasica-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'Avustralya yerli turunçgili. Yüksek konsantrasyonda AHA (sitrik, malik) + C vitamini. Hafif eksfoliyan + parlaklık verici.',
    evidence_grade: 'D',
    safety_class: 'neutral',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 3.0,
    citations: [
      { source: 'Manufacturer claim', title: 'Native AU AHA fruit extract analytics', year: 2021 },
    ],
  },
  {
    inci_name: 'Scutellaria Baicalensis Root Extract',
    common_name: 'Bayağı Kafa Otu / Baikal Skullcap Kök Ekstresi',
    slug: 'scutellaria-baicalensis-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'Baikalein, baikalin gibi flavonoidler içerir. Güçlü antioksidan + anti-enflamatuar. Hassas ciltlerde kızarıklığı yatıştırır.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 2.0,
    citations: [
      { source: 'PubMed', pmid: '21195583', title: 'Baicalin anti-inflammatory skin', year: 2011 },
    ],
  },
  {
    inci_name: 'Tasmannia Lanceolata Fruit Extract',
    common_name: 'Tasmanya Karabiber Meyve Ekstresi',
    slug: 'tasmannia-lanceolata-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'Polygodial ve antosiyaninler içerir. Antioksidan + anti-iritan etki. Hassas cilt formüllerinde nadir kullanılan aktif.',
    evidence_grade: 'D',
    safety_class: 'neutral',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 1.0,
    citations: [
      { source: 'Manufacturer', title: 'Tasmanian pepperberry skin soothing', year: 2020 },
    ],
  },
  {
    inci_name: 'Anigozanthos Flavidus Flower Extract',
    common_name: 'Sarı Kanguru Pençesi Çiçek Ekstresi',
    slug: 'anigozanthos-flavidus-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'Avustralya endemik çiçek ekstresi. Glikoprotein içeriği nem tutma kapasitesini artırır, polen-bazlı sığ peptit antioksidan etki.',
    evidence_grade: 'E',
    safety_class: 'neutral',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 1.0,
    citations: [
      { source: 'Manufacturer', title: 'Native AU flower extract moisturization', year: 2021 },
    ],
  },
  {
    inci_name: 'Terminalia Ferdinandiana Fruit Extract',
    common_name: 'Kakadu Erik Ekstresi (Yüksek C Vitamini)',
    slug: 'terminalia-ferdinandiana-extract',
    group: 'antioxidant',
    origin: 'natural',
    function_summary: 'Dünyada en yüksek C vitamini konsantrasyonuna sahip meyve (3-5 g/100g). Polifenol + ellagik asit ile cilt parlaklığı + leke açıcı destek.',
    evidence_grade: 'C',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 3.0,
    citations: [
      { source: 'PubMed', pmid: '27754525', title: 'Kakadu plum vitamin C content analysis', year: 2016 },
    ],
  },
  {
    inci_name: 'Hibiscus Sabdariffa Flower Extract',
    common_name: 'Hibiskus / Roselle Çiçek Ekstresi',
    slug: 'hibiscus-sabdariffa-extract',
    group: 'botanical',
    origin: 'natural',
    function_summary: 'Doğal AHA (sitrik, malik), antosiyanin ve flavonoidler. Hafif eksfoliyan + antioksidan + parlatıcı. "Botanik retinol" olarak pazarlanır.',
    evidence_grade: 'C',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'PubMed', pmid: '32366950', title: 'Hibiscus extract skin antioxidant', year: 2020 },
    ],
  },
  {
    inci_name: 'Chondrus Crispus Extract',
    common_name: 'Irish Moss / Karagen Yosun Ekstresi',
    slug: 'chondrus-crispus-extract',
    group: 'humectant',
    origin: 'natural',
    function_summary: 'Karagen polisakkarit + sülfatlı şeker grupları. Cilt yüzeyinde nem tutucu film oluşturur, kuru ciltte bariyer destek sağlar.',
    evidence_grade: 'C',
    safety_class: 'neutral',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'CIR', title: 'Carrageenan cosmetic safety', year: 2018 },
    ],
  },
  {
    inci_name: 'Epilobium Angustifolium Extract',
    common_name: 'Yakı Otu / Willowherb Ekstresi (Canadian Willow Herb)',
    slug: 'epilobium-angustifolium-extract',
    group: 'active',
    origin: 'natural',
    function_summary: 'Oenotein-B (elagitannin) ana aktif bileşeni. 5-alfa redüktaz enzimini bloke ederek hormonal akneye karşı destek + antimikrobiyal etki.',
    evidence_grade: 'C',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 3.0,
    citations: [
      { source: 'PubMed', pmid: '17004975', title: 'Canadian willowherb anti-acne', year: 2007 },
    ],
  },
  {
    inci_name: 'Centella Asiatica Extract',
    common_name: 'Cica / Gotu Kola Ekstresi',
    slug: 'centella-asiatica-extract',
    group: 'active',
    origin: 'natural',
    function_summary: 'Madekassosit, asiatikosit ve madecassic asit triterpenleri. Yara iyileşmesi, hassasiyet azaltma ve bariyer onarımı için K-beauty kanıtlı aktif.',
    evidence_grade: 'A',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 5.0,
    citations: [
      { source: 'PubMed', pmid: '27145061', title: 'Centella asiatica wound healing review', year: 2016 },
    ],
  },

  // ── RETİNOL / RETİNOL-ALTERNATİF ───────────────────────────────────
  {
    inci_name: 'Bakuchiol',
    common_name: 'Bakuçiol (Bitkisel Retinol Alternatifi)',
    slug: 'bakuchiol',
    group: 'active',
    origin: 'natural',
    function_summary: 'Psoralea corylifolia\'dan elde edilen meroterpen. Retinol benzeri gen ekspresyon değişimi sağlar (kolajen I, MMP-1). Foto-stabil, hamilelikte güvenli.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.5,
    efficacy_conc_max: 2.0,
    citations: [
      { source: 'PubMed', pmid: '29947134', title: 'Bakuchiol vs retinol clinical comparison', year: 2018 },
    ],
  },

  // ── HİYALÜRONİK ASİT VARYASYONU ────────────────────────────────────
  {
    inci_name: 'Sodium Hyaluronate Crosspolymer',
    common_name: 'Çapraz Bağlı Sodyum Hiyalüronat',
    slug: 'sodium-hyaluronate-crosspolymer',
    group: 'humectant',
    origin: 'biotechnology',
    function_summary: 'Çapraz bağlı (cross-linked) hiyalüronat ağı. Standart HA\'dan uzun süreli nem tutar ve cilt yüzeyinde film + filler benzeri dolgun görüntü sağlar.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 2.0,
    citations: [
      { source: 'PubMed', pmid: '33245876', title: 'Crosslinked HA skin hydration', year: 2020 },
    ],
  },

  // ── ANTIOKSIDAN ALTIN STANDART ─────────────────────────────────────
  {
    inci_name: 'Ergothioneine',
    common_name: 'Ergotionein (Mantar Antioksidanı)',
    slug: 'ergothioneine',
    group: 'antioxidant',
    origin: 'natural',
    function_summary: 'Mantarlardan elde edilen tiyol amino asit. Mitokondri spesifik antioksidan, hücre içi serbest radikalleri etkili nötralize eder. Stabil.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 1.0,
    citations: [
      { source: 'PubMed', pmid: '29222785', title: 'Ergothioneine skin antioxidant review', year: 2018 },
    ],
  },
  {
    inci_name: 'Resveratrol',
    common_name: 'Resveratrol (Kozmetik Aktif Form)',
    slug: 'resveratrol-cosmetic',
    group: 'antioxidant',
    origin: 'natural',
    function_summary: 'Üzüm kabuğu polifenolü. Sirtuin yolak aktivasyonu, UV oksidatif hasarı azaltma ve kolajen koruma. Niyasinamid ile sinerjik etki literatürde kanıtlı.',
    evidence_grade: 'B',
    safety_class: 'beneficial',
    efficacy_conc_min: 0.1,
    efficacy_conc_max: 1.0,
    citations: [
      { source: 'PubMed', pmid: '24882253', title: 'Resveratrol photoprotection clinical', year: 2014 },
    ],
  },
];

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    console.log(`\n🧪 Modül H — Niche INCI seed (${INGREDIENTS.length} kayıt) ${apply ? '[APPLY]' : '[DRY-RUN]'}\n`);

    // Mevcut slug'ları kontrol et
    const slugs = INGREDIENTS.map((i) => i.slug);
    const existing = await client.query(
      `SELECT ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [slugs],
    );
    const existingSet = new Set(existing.rows.map((r) => r.ingredient_slug));
    const toInsert = INGREDIENTS.filter((i) => !existingSet.has(i.slug));

    console.log(`  Mevcut (atlanacak): ${existingSet.size}`);
    console.log(`  Yeni eklenecek: ${toInsert.length}\n`);

    if (!apply) {
      console.log(`  ── Yeni eklenecekler ──`);
      toInsert.forEach((i, idx) => {
        console.log(`    ${String(idx + 1).padStart(2)}. ${i.inci_name.padEnd(45)} | grade=${i.evidence_grade} | conc ${i.efficacy_conc_min}-${i.efficacy_conc_max}%`);
      });
      console.log(`\n  → --apply ile uygula`);
      return;
    }

    await client.query('BEGIN');
    let inserted = 0;
    for (const ing of toInsert) {
      await client.query(
        `INSERT INTO ingredients (
          domain_type, inci_name, common_name, ingredient_slug, ingredient_group,
          origin_type, function_summary, evidence_grade, evidence_citations,
          safety_class, efficacy_conc_min, efficacy_conc_max, preservative_flag,
          is_active, created_at, updated_at
        ) VALUES (
          'cosmetic', $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, true, NOW(), NOW()
        )
        ON CONFLICT (ingredient_slug) DO NOTHING`,
        [
          ing.inci_name,
          ing.common_name,
          ing.slug,
          ing.group,
          ing.origin,
          ing.function_summary,
          ing.evidence_grade,
          JSON.stringify(ing.citations),
          ing.safety_class,
          ing.efficacy_conc_min ?? null,
          ing.efficacy_conc_max ?? null,
          ing.preservative ?? false,
        ],
      );
      inserted++;
    }
    await client.query('COMMIT');

    console.log(`  ✓ ${inserted} INCI eklendi`);

    // Cache invalidate
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && inserted > 0) {
      try {
        const Redis = (await import('ioredis')).default;
        const useTls = redisUrl.startsWith('rediss://');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        });
        let flushed = 0;
        for (const pattern of ['ingredient:slug:*', 'ingredients:list:*', 'inci:*']) {
          const keys = await redis.keys(pattern);
          if (keys.length) {
            await redis.del(...keys);
            flushed += keys.length;
          }
        }
        await redis.quit();
        console.log(`  ✓ ${flushed} Redis key flushed`);
      } catch (e) {
        console.log(`  ⚠ Redis flush atlandı: ${e.message}`);
      }
    }

    const after = await client.query(
      `SELECT COUNT(*)::int AS n FROM ingredients WHERE domain_type = 'cosmetic'`,
    );
    console.log(`\n  Toplam cosmetic ingredient: ${after.rows[0].n}`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAILED:', e);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
