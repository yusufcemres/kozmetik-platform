const { Client } = require('pg');

const PGCONN = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Classification rules — order matters! First match wins.
// Each rule: { keywords: [regex], parent_slug, sub_slug }
const RULES = [
  // === SAÇ BAKIM (catch early — shampoo, hair) ===
  { kw: [/shampoo/i, /şampuan/i, /sampuan/i], parent: 'sac-bakim', sub: 'sampuan' },
  { kw: [/hair.*mask/i, /saç.*mask/i, /sac.*mask/i], parent: 'sac-bakim', sub: 'sac-maskesi' },
  { kw: [/hair.*serum/i, /hair.*oil/i, /saç.*serum/i, /saç.*yağ/i], parent: 'sac-bakim', sub: 'sac-serumu-yagi' },
  { kw: [/hair/i, /saç/i, /dercos/i, /dercapillaire/i, /anacaps/i], parent: 'sac-bakim', sub: 'sac-kremi-bakim' },

  // === MAKYAJ (catch early) ===
  { kw: [/foundation/i, /fondöten/i, /bb\s+cream/i, /bb\s+krem/i, /cc\s+cream/i, /cc\s+krem/i], parent: 'makyaj', sub: 'fondoten-bb-krem' },
  { kw: [/blush/i, /allık/i, /bronzer/i, /bronzlaştırıcı/i], parent: 'makyaj', sub: 'allik-bronzer' },
  { kw: [/lipstick/i, /ruj\b/i, /lip.*color/i, /lip.*gloss/i, /lip.*tint/i], parent: 'makyaj', sub: 'ruj-dudak-makyaji' },
  { kw: [/mascara/i, /maskara/i, /eyeliner/i, /eye.*liner/i, /kaş/i, /brow\b/i, /kajal/i], parent: 'makyaj', sub: 'maskara-eyeliner' },
  { kw: [/pudra/i, /powder(?!.*clean|.*wash)/i, /aydınlatıcı/i, /highlight/i, /illuminat/i], parent: 'makyaj', sub: 'pudra-aydinlatici' },
  { kw: [/kapatıcı/i, /concealer/i, /korrektör/i, /corrector/i], parent: 'makyaj', sub: 'kapatici-korrektor' },

  // === DUDAK BAKIM (lip-specific, before cleanser rules) ===
  { kw: [/lip.*scrub/i, /dudak.*peel/i, /lip.*peel/i, /dudak.*scrub/i], parent: 'dudak-bakim', sub: 'dudak-peelingi' },
  { kw: [/lip.*mask/i, /dudak.*mask/i, /lip.*sleep/i], parent: 'dudak-bakim', sub: 'dudak-maskesi' },
  { kw: [/lip.*oil/i, /dudak.*yağ/i], parent: 'dudak-bakim', sub: 'dudak-yagi' },
  { kw: [/lip\b/i, /dudak/i, /levres/i, /lip.*balm/i, /chapstick/i], parent: 'dudak-bakim', sub: 'dudak-nemlendirici' },

  // === GÖZ BAKIM (eye-specific, before general) ===
  { kw: [/eye.*serum/i, /göz.*serum/i, /goz.*serum/i], parent: 'goz-bakim', sub: 'goz-serumu' },
  { kw: [/eye.*mask/i, /eye.*patch/i, /göz.*mask/i, /göz.*patch/i, /goz.*mask/i, /goz.*patch/i, /hydrogel.*eye/i], parent: 'goz-bakim', sub: 'goz-maskesi-patch' },
  { kw: [/eye\b/i, /göz/i, /goz\b/i, /yeux/i, /eye.*cream/i, /göz.*krem/i], parent: 'goz-bakim', sub: 'goz-kremi' },

  // === TEMİZLEME (before moisturizers, SPF) ===
  { kw: [/micel/i, /misel/i, /\bh2o\b/i], parent: 'temizleme', sub: 'misel-su' },
  { kw: [/clean.*balm/i, /balm.*clean/i, /clean.*oil\b/i, /oil.*clean/i, /temiz.*yağ/i, /precleanse/i, /sherbet/i], parent: 'temizleme', sub: 'temizleme-yagi-balm' },
  { kw: [/foam(?!.*hand)/i, /köpü/i, /mousse(?!.*styl)/i, /moussant/i], parent: 'temizleme', sub: 'temizleme-kopugu' },
  { kw: [/milk.*clean/i, /clean.*milk/i, /süt/i, /lait(?!.*corp)/i, /temiz.*süt/i], parent: 'temizleme', sub: 'temizleme-sutu' },
  { kw: [/makeup.*remov/i, /remov/i, /makyaj.*temiz/i, /demaq/i], parent: 'temizleme', sub: 'makyaj-temizleyici' },
  { kw: [/clean/i, /temiz/i, /wash(?!.*moist)/i, /syndet/i, /soap/i, /sabun/i, /gel.*nettoy/i, /purif.*gel/i], parent: 'temizleme', sub: 'yuz-temizleme-jeli' },

  // === GÜNEŞ KORUMA (SPF products) ===
  { kw: [/tint.*spf/i, /spf.*tint/i, /renkli.*güneş/i, /colored.*sun/i, /mineral.*one.*spf/i, /pigment.*spf/i], parent: 'gunes-koruma', sub: 'renkli-gunes-kremi' },
  { kw: [/sun.*spray/i, /spray.*spf/i, /güneş.*sprey/i, /sprey.*güneş/i], parent: 'gunes-koruma', sub: 'gunes-spreyi' },
  { kw: [/after.*sun/i, /güneş.*sonrası/i, /gunes.*sonrasi/i], parent: 'gunes-koruma', sub: 'gunes-sonrasi-bakim' },
  { kw: [/body.*spf/i, /body.*sun/i, /vücut.*güneş/i, /vucut.*gunes/i], parent: 'gunes-koruma', sub: 'vucut-gunes-kremi' },
  { kw: [/spf\d/i, /\bspf\b/i, /sun\s/i, /sun$/i, /sunscreen/i, /güneş/i, /gunes/i, /\buv\b/i, /uvmune/i, /photoderm/i, /anthelios/i, /solaire/i, /heliocare/i], parent: 'gunes-koruma', sub: 'yuz-gunes-kremi' },

  // === VÜCUT BAKIM ===
  { kw: [/\bel\s+krem/i, /hand\s*cream/i, /hand\s*krem/i, /el\s+bakım/i], parent: 'vucut-bakim', sub: 'el-kremi' },
  { kw: [/ayak/i, /foot/i], parent: 'vucut-bakim', sub: 'ayak-bakim' },
  { kw: [/body.*oil/i, /vücut.*yağ/i, /vucut.*yag/i, /huile.*prodigieuse/i], parent: 'vucut-bakim', sub: 'vucut-yagi' },
  { kw: [/body.*lotion/i, /vücut.*losyon/i, /body.*milk/i, /lait.*corp/i, /lipikar.*lait/i], parent: 'vucut-bakim', sub: 'vucut-losyonu' },
  { kw: [/body/i, /vücut/i, /vucut/i, /corps/i, /lipikar/i, /atoderm/i, /xemose/i, /xeracalm/i, /topialyse/i, /atopi.*control/i, /itch.*relief/i], parent: 'vucut-bakim', sub: 'vucut-nemlendirici' },
  { kw: [/shower/i, /bath\b/i, /duş/i, /banyo/i, /body.*wash/i], parent: 'vucut-bakim', sub: 'vucut-nemlendirici' },

  // === YÜZ BAKIM (serums, creams, masks, etc.) ===
  { kw: [/sleeping.*mask/i, /sleeping.*pack/i, /overnight.*mask/i, /night.*mask/i, /gece.*mask/i], parent: 'yuz-bakim', sub: 'gece-bakim' },
  { kw: [/sheet.*mask/i, /wash.*off.*mask/i, /clay.*mask/i, /peel.*off.*mask/i, /hydrogel(?!.*eye)/i, /jelly.*pack/i], parent: 'yuz-bakim', sub: 'yuz-maskesi' },
  { kw: [/\bmask\b(?!ara)/i, /\bmaske\b(?!.*dudak|.*göz|.*saç)/i, /\bpack\b/i, /\bpatch\b(?!.*göz|.*eye)/i], parent: 'yuz-bakim', sub: 'yuz-maskesi' },
  { kw: [/peeling/i, /exfoli/i, /aha.*bha/i, /gauze.*peel/i, /babyfacial/i, /micro.*peel/i], parent: 'yuz-bakim', sub: 'peeling-eksfolyan' },
  { kw: [/pad\b/i, /pads\b/i, /toner/i, /tonik/i, /toniği/i, /toning.*solution/i, /lotion(?!.*body|.*vucut|.*spf)/i, /losyon(?!.*güneş|.*vücut)/i, /\bmist\b/i, /thermal.*water/i], parent: 'yuz-bakim', sub: 'tonik-losyon' },
  { kw: [/serum/i, /serumu/i, /ampul/i, /ampoule/i, /booster/i, /concentrate/i, /concentré/i, /\bessence\b/i, /elixir/i, /\bdrop\b/i, /\bdrops\b/i, /liquid(?!.*clean|.*wash)/i, /power\b/i], parent: 'yuz-bakim', sub: 'serum-ampul' },
  { kw: [/face.*oil/i, /facial.*oil/i, /yüz.*yağ/i, /oil(?!.*clean|.*body|.*hair|.*saç|.*bath)/i], parent: 'yuz-bakim', sub: 'yuz-yagi' },
  { kw: [/night/i, /gece/i, /akşam/i, /nuit/i, /overnight(?!.*mask)/i], parent: 'yuz-bakim', sub: 'gece-bakim' },
  { kw: [/anti.?aging/i, /kırışıklık/i, /wrinkle/i, /liftactiv/i, /retinol/i, /retinal\b/i, /lifting/i, /\bfirm/i, /filler/i, /collagen(?!.*lip)/i, /peptide/i, /regenerist/i], parent: 'yuz-bakim', sub: 'anti-aging-bakim' },
  { kw: [/leke/i, /pigment/i, /bright/i, /aydınlat/i, /whitening/i, /dark.*spot/i, /arbutin/i, /depigment/i, /melasolv/i, /clairial/i, /glycolic.*bright/i, /niacinamide(?!.*clean)/i], parent: 'yuz-bakim', sub: 'leke-bakim' },
  { kw: [/sivilce/i, /akne/i, /acne/i, /blemish/i, /breakout/i, /effaclar/i, /sebium/i, /normaderm/i, /dermopure/i, /purif(?!.*clean)/i, /salicylic/i, /anti.*blemish/i], parent: 'yuz-bakim', sub: 'sivilce-bakim' },
  { kw: [/bariyer/i, /barrier/i, /cicaplast/i, /cicalfate/i, /\bcica\b/i, /repair/i, /onarıcı/i, /restor/i, /rescue/i, /sos\b/i], parent: 'yuz-bakim', sub: 'cilt-bariyeri' },
  // Default face cream/moisturizer — last resort for yüz bakım
  { kw: [/cream/i, /krem/i, /moistur/i, /nemlendirici/i, /hydra/i, /gel.*cream/i, /emulsion/i, /\bbalm\b/i, /baume/i, /creme/i, /riche/i, /lotion\+/i, /surge/i, /aqualia/i, /toleriane/i, /nmf/i, /factors/i], parent: 'yuz-bakim', sub: 'nemlendirici-krem' },

  // === CATCH-ALL for remaining ===
  { kw: [/solution/i, /suspension/i, /hyaluron/i, /\bacid\b/i, /caffeine/i, /marine/i, /glucoside/i, /ascorbyl/i, /spheres/i, /fractions/i], parent: 'yuz-bakim', sub: 'serum-ampul' },
  { kw: [/\beyes?\b/i, /yeux/i], parent: 'goz-bakim', sub: 'goz-kremi' },
  { kw: [/ointment/i, /merhem/i], parent: 'yuz-bakim', sub: 'cilt-bariyeri' },
  { kw: [/\bgel\b/i, /jel\b/i, /water.*gel/i], parent: 'yuz-bakim', sub: 'nemlendirici-krem' },
  { kw: [/beauty.*bar/i, /\bbar\b/i, /sabun/i], parent: 'temizleme', sub: 'yuz-temizleme-jeli' },
  { kw: [/supplement/i, /takviye/i], parent: 'sac-bakim', sub: 'sac-kremi-bakim' },
  { kw: [/deodorant/i], parent: 'vucut-bakim', sub: 'vucut-nemlendirici' },
];

// Slug -> category_id mapping (will be populated)
const SLUG_TO_PARENT = {
  'yuz-bakim': null, 'temizleme': null, 'gunes-koruma': null,
  'goz-bakim': null, 'dudak-bakim': null, 'vucut-bakim': null,
  'sac-bakim': null, 'makyaj': null,
};

// Subcategories: [parent_slug, name, slug, sort_order]
const SUBCATEGORIES = [
  ['yuz-bakim', 'Nemlendirici Krem', 'nemlendirici-krem', 1],
  ['yuz-bakim', 'Serum & Ampul', 'serum-ampul', 2],
  ['yuz-bakim', 'Peeling & Eksfolyan', 'peeling-eksfolyan', 3],
  ['yuz-bakim', 'Tonik & Losyon', 'tonik-losyon', 4],
  ['yuz-bakim', 'Yüz Maskesi', 'yuz-maskesi', 5],
  ['yuz-bakim', 'Yüz Yağı', 'yuz-yagi', 6],
  ['yuz-bakim', 'Gece Bakım', 'gece-bakim', 7],
  ['yuz-bakim', 'Anti-Aging Bakım', 'anti-aging-bakim', 8],
  ['yuz-bakim', 'Leke Bakım', 'leke-bakim', 9],
  ['yuz-bakim', 'Sivilce Bakım', 'sivilce-bakim', 10],
  ['yuz-bakim', 'Cilt Bariyeri', 'cilt-bariyeri', 11],
  ['temizleme', 'Yüz Temizleme Jeli', 'yuz-temizleme-jeli', 1],
  ['temizleme', 'Misel Su', 'misel-su', 2],
  ['temizleme', 'Temizleme Köpüğü', 'temizleme-kopugu', 3],
  ['temizleme', 'Temizleme Sütü', 'temizleme-sutu', 4],
  ['temizleme', 'Temizleme Yağı & Balm', 'temizleme-yagi-balm', 5],
  ['temizleme', 'Peeling Temizleyici', 'peeling-temizleyici', 6],
  ['temizleme', 'Makyaj Temizleyici', 'makyaj-temizleyici', 7],
  ['gunes-koruma', 'Yüz Güneş Kremi', 'yuz-gunes-kremi', 1],
  ['gunes-koruma', 'Vücut Güneş Kremi', 'vucut-gunes-kremi', 2],
  ['gunes-koruma', 'Renkli Güneş Kremi', 'renkli-gunes-kremi', 3],
  ['gunes-koruma', 'Güneş Spreyi', 'gunes-spreyi', 4],
  ['gunes-koruma', 'Güneş Sonrası Bakım', 'gunes-sonrasi-bakim', 5],
  ['goz-bakim', 'Göz Kremi', 'goz-kremi', 1],
  ['goz-bakim', 'Göz Serumu', 'goz-serumu', 2],
  ['goz-bakim', 'Göz Maskesi & Patch', 'goz-maskesi-patch', 3],
  ['dudak-bakim', 'Dudak Nemlendirici', 'dudak-nemlendirici', 1],
  ['dudak-bakim', 'Dudak Peelingi', 'dudak-peelingi', 2],
  ['dudak-bakim', 'Dudak Maskesi', 'dudak-maskesi', 3],
  ['dudak-bakim', 'Dudak Yağı', 'dudak-yagi', 4],
  ['vucut-bakim', 'Vücut Nemlendirici', 'vucut-nemlendirici', 1],
  ['vucut-bakim', 'Vücut Losyonu', 'vucut-losyonu', 2],
  ['vucut-bakim', 'Vücut Yağı', 'vucut-yagi', 3],
  ['vucut-bakim', 'El Kremi', 'el-kremi', 4],
  ['vucut-bakim', 'Ayak Bakım', 'ayak-bakim', 5],
  ['sac-bakim', 'Şampuan', 'sampuan', 1],
  ['sac-bakim', 'Saç Maskesi', 'sac-maskesi', 2],
  ['sac-bakim', 'Saç Serumu & Yağı', 'sac-serumu-yagi', 3],
  ['sac-bakim', 'Saç Kremi & Bakım', 'sac-kremi-bakim', 4],
  ['makyaj', 'Fondöten & BB Krem', 'fondoten-bb-krem', 1],
  ['makyaj', 'Allık & Bronzer', 'allik-bronzer', 2],
  ['makyaj', 'Ruj & Dudak Makyajı', 'ruj-dudak-makyaji', 3],
  ['makyaj', 'Maskara & Eyeliner', 'maskara-eyeliner', 4],
  ['makyaj', 'Pudra & Aydınlatıcı', 'pudra-aydinlatici', 5],
  ['makyaj', 'Kapatıcı & Korrektör', 'kapatici-korrektor', 6],
];

async function main() {
  const client = new Client({ connectionString: PGCONN, ssl: false });
  await client.connect();
  console.log('Connected');

  // 0. Get parent category IDs
  const cats = await client.query("SELECT category_id, category_slug FROM categories WHERE parent_category_id IS NULL");
  for (const c of cats.rows) {
    if (SLUG_TO_PARENT[c.category_slug] !== undefined) {
      SLUG_TO_PARENT[c.category_slug] = c.category_id;
    }
  }
  console.log('Parent IDs:', SLUG_TO_PARENT);

  // 1. Delete existing subcategories (reset products to parent first)
  await client.query(`
    UPDATE products p SET category_id = c.parent_category_id
    FROM categories c
    WHERE p.category_id = c.category_id AND c.parent_category_id IS NOT NULL
  `);
  await client.query("DELETE FROM categories WHERE parent_category_id IS NOT NULL");
  console.log('Cleared existing subcategories');

  // 2. Insert subcategories
  const slugToId = {};
  for (const [parentSlug, name, slug, sortOrder] of SUBCATEGORIES) {
    const parentId = SLUG_TO_PARENT[parentSlug];
    const res = await client.query(
      `INSERT INTO categories (parent_category_id, category_name, category_slug, domain_type, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'cosmetic', $4, true, NOW(), NOW())
       ON CONFLICT (category_slug) DO UPDATE SET category_name = $2, parent_category_id = $1
       RETURNING category_id`,
      [parentId, name, slug, sortOrder]
    );
    slugToId[slug] = res.rows[0].category_id;
  }
  // Also map parent slugs to their IDs
  for (const [slug, id] of Object.entries(SLUG_TO_PARENT)) {
    slugToId[slug] = id;
  }
  console.log(`Inserted ${SUBCATEGORIES.length} subcategories`);

  // 3. Classify ALL products by name
  const products = await client.query('SELECT product_id, product_name FROM products ORDER BY product_id');
  console.log(`Total products: ${products.rows.length}`);

  let matched = 0, unmatched = 0;
  const unmatchedNames = [];

  for (const p of products.rows) {
    const name = p.product_name;
    let newCatId = null;

    for (const rule of RULES) {
      for (const kw of rule.kw) {
        if (kw.test(name)) {
          newCatId = slugToId[rule.sub];
          break;
        }
      }
      if (newCatId) break;
    }

    if (newCatId) {
      await client.query('UPDATE products SET category_id = $1 WHERE product_id = $2', [newCatId, p.product_id]);
      matched++;
    } else {
      unmatched++;
      if (unmatchedNames.length < 30) unmatchedNames.push(name);
    }
  }

  console.log(`\nMatched: ${matched}, Unmatched: ${unmatched}`);
  if (unmatchedNames.length) {
    console.log('Sample unmatched:', unmatchedNames.slice(0, 15).join(' | '));
  }

  // 4. Show distribution
  const result = await client.query(`
    SELECT
      COALESCE(c2.category_name, c.category_name) as parent,
      CASE WHEN c.parent_category_id IS NOT NULL THEN c.category_name ELSE '(genel)' END as sub,
      COUNT(p.product_id) as count
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN categories c2 ON c.parent_category_id = c2.category_id
    GROUP BY parent, sub
    ORDER BY parent, count DESC
  `);

  console.log('\n--- Kategori Dağılımı ---');
  let currentParent = '';
  for (const r of result.rows) {
    if (r.parent !== currentParent) {
      currentParent = r.parent;
      console.log(`\n${currentParent}:`);
    }
    console.log(`  ${r.sub}: ${r.count}`);
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
