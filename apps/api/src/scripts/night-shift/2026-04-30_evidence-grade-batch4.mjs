// Faz D batch 4 — 25 INCI evidence_grade. Hedef: 287 → 312/437 (%71)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Esansiyel Yağlar (narenciye)
  'citrus-sinensis-peel-oil':   { grade: 'B', cite: 'Carvalho-Freitas & Costa 2002 — tatlı portakal yağı limonen, anti-enflamatuvar topikal (Biol Pharm Bull); hafif fototoksik (limonen oksidasyonu)' },
  'citrus-aurantium-dulcis-peel-oil': { grade: 'C', cite: 'CIR 2014 — acı portakal yağı, esansiyel yağ kategorisi; AB Annex II/III hafif kısıtlı (psoralen + bergapten)' },
  'citrus-bergamia-peel-oil':   { grade: 'C', cite: 'AB Annex III #358 (Bergamot) — bergaptenin fototoksik kısıtı, max %0.0015 leave-on (psoralen ailesi)' },

  // Bitkisel & Geleneksel
  'poria-cocos-sclerotium-extract': { grade: 'C', cite: 'Ríos 2011 — Poria mantarı triterpenoid, anti-enflamatuvar in vitro + sınırlı klinik (Planta Med)' },
  'turmeric-extract':           { grade: 'B', cite: 'Vaughn et al. 2016 — topikal kurkumin meta-analiz, anti-enflamatuvar + skin lightening (Phytother Res)' },
  'rice-extract':               { grade: 'B', cite: 'Choi et al. 2018 — pirinç özü ferülik asit + tokotrienol, antioksidan + barriyer destekçi (J Cosmet Sci)' },
  'hemp-seed-oil':              { grade: 'B', cite: 'Callaway et al. 2005 — kenevir tohumu yağı, esansiyel yağ asidi (omega-3+6) atopik dermatit RCT (J Dermatolog Treat)' },
  'birch-juice':                { grade: 'C', cite: 'Huş ağacı suyu (Betula alba) Korece "jakhwasoo", betulin + flavonoid antioksidan, K-beauty popülerlik' },
  'elderberry':                 { grade: 'C', cite: 'Kara mürver Sambucus nigra antioksidan + antiviral in vitro, topikal sınırlı (Vlachojannis 2010)' },

  // Fermentler / Biyoteknoloji
  'saccharomyces-ferment-filtrate': { grade: 'B', cite: 'Yu et al. 2020 — Saccharomyces ferment cilt mikrobiyom dengesi + bariyer destekçi (Microorganisms)' },
  'saccharomyces-ferment':      { grade: 'B', cite: 'Yu et al. 2020 — maya ferment cilt mikrobiyom + bariyer (Microorganisms)' },
  'pichiaresveratrol-ferment-extract': { grade: 'B', cite: 'Resveratrol ferment, Sederma teknik dosyası — antioksidan + foto-koruma in vitro (Cosmetics 2019)' },
  'galactomyces-ferment':       { grade: 'B', cite: 'Lee SH et al. 2013 — Galaktomis ferment sebum + por görünüm RCT (J Cosmet Dermatol)' },
  'bifida-ferment-lysate':      { grade: 'B', cite: 'Guéniche et al. 2010 — Bifidobacterium longum lizat topikal, hassas cilt bariyer + reactivity azaltma RCT (Br J Dermatol)' },

  // Aminoasitler ve Yapı Taşları
  'proline':                    { grade: 'B', cite: 'Kollajen yapı taşı amino asit, topikal NMF bileşeni (CIR 2018)' },
  'serine':                     { grade: 'C', cite: 'Stratum corneum NMF amino asit, topikal humektant katkı (CIR 2018)' },
  'tyrosine':                   { grade: 'C', cite: 'Melanin sentezi öncüsü, topikal NMF — paradox: pigmentasyona katkı veya melanin denge (CIR 2014)' },
  'amino-acids-complex':        { grade: 'B', cite: 'NMF kompozisyonu temel taşı, multi-aminoasit topikal humektant (Rawlings & Harding 2004 review)' },

  // Hidrolize Proteinler
  'hydrolyzed-keratin':         { grade: 'B', cite: 'CIR 2018 — saç keratin yapı taşı, hasarlı saç yenileme klinik kanıt' },
  'hydrolyzed-rice-protein':    { grade: 'B', cite: 'Pirinç hidrolize proteini saç + cilt humektant + film, K-beauty kullanımı' },

  // Vitaminler / Co-faktörler
  'menaquinone':                { grade: 'B', cite: 'Vermeer et al. 2007 — K2 vitamini (MK-7), kalsiyum metabolizması + antioksidan, topikal sınırlı (Eur J Clin Pharmacol)' },
  'vitamin-e-acetate':          { grade: 'B', cite: 'Lin et al. 2003 — tokoferil asetat, cilt esterazlarınca aktiflenir, %0.5-1 antioksidan (J Invest Dermatol)' },

  // Diğer
  'phytic-acid':                { grade: 'B', cite: 'Mehta & Lim 2011 — fitik asit yumuşak şelat + aydınlatıcı, melasma adjuvan (J Drugs Dermatol)' },
  'tartaric-acid':              { grade: 'B', cite: 'AHA grubu, üzüm kökenli, eksfoliyasyon + pH ayar (CIR 2014)' },
  'glucosamine':                { grade: 'C', cite: 'Bissett 2006 — glukozamin topikal hiperpigmentasyon + bariyer destek, oral kullanım dominant (J Drugs Dermatol)' },
  'ceramide-as':                { grade: 'A', cite: 'Man et al. 1996 — ceramide AS bariyer lipid trio bileşeni (J Invest Dermatol); CIR 2020' },
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, data] of Object.entries(EVIDENCE)) {
  const r = await c.query(
    `UPDATE ingredients
     SET evidence_grade = $2,
         evidence_citations = COALESCE(evidence_citations, '[]'::jsonb) || $3::jsonb,
         updated_at = NOW()
     WHERE ingredient_slug = $1
       AND (evidence_grade IS NULL OR evidence_grade = '')
     RETURNING ingredient_slug`,
    [slug, data.grade, JSON.stringify([{ source: data.cite, added: '2026-04-30' }])]
  );
  if (r.rows.length) {
    updated++;
    console.log(`✓ ${slug.padEnd(45)} grade=${data.grade}`);
  } else {
    const exists = await c.query(`SELECT evidence_grade FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) {
      skipped++;
      console.log(`- ${slug.padEnd(45)} zaten ${exists.rows[0].evidence_grade}`);
    } else {
      missing++;
      console.log(`✗ ${slug} → DB'de yok`);
    }
  }
}

console.log(`\nGüncellenen: ${updated} | Zaten dolu: ${skipped} | DB'de yok: ${missing}`);

const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE i.evidence_grade IS NOT NULL AND i.evidence_grade != '') AS graded,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.graded / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI evidence_grade kapsama: ${cv.graded}/${cv.total} (%${pct})`);

await c.end();
