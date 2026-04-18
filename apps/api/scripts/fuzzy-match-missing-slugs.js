/**
 * Eksik 21 supplement + 19 cosmetic slug'ı common_name / inci_name üzerinden
 * fuzzy match ile bul, slug'ı düzelt (veya yeni kayıt ekle), sonra seed'leri
 * yeniden çalıştır.
 *
 * İlk tur: sadece MATCH REPORT üret (dry-run). Onaylandığında --apply ile slug update.
 */
const { Client } = require('pg');

const MISSING_SUPPLEMENTS = [
  { slug: 'omega-6', aliases: ['omega 6', 'omega-6', 'gamma linoleic', 'GLA', 'evening primrose'] },
  { slug: 'ashwagandha', aliases: ['ashwagandha', 'withania somnifera'] },
  { slug: 'glucosamine', aliases: ['glucosamine', 'glukozamin'] },
  { slug: 'chondroitin', aliases: ['chondroitin', 'kondroitin'] },
  { slug: 'saw-palmetto', aliases: ['saw palmetto', 'serenoa repens'] },
  { slug: 'ginkgo-biloba', aliases: ['ginkgo', 'ginkgo biloba'] },
  { slug: 'milk-thistle', aliases: ['milk thistle', 'silybum', 'silymarin', 'deve dikeni'] },
  { slug: 'spirulina', aliases: ['spirulina', 'arthrospira'] },
  { slug: 'berberine', aliases: ['berberine', 'berberin'] },
  { slug: 'psyllium', aliases: ['psyllium', 'plantago ovata', 'lif tozu'] },
];

const MISSING_COSMETICS = [
  { target: 'Paraffinum Liquidum', aliases: ['paraffinum liquidum', 'mineral oil', 'liquid paraffin'] },
  { target: 'Benzophenone-3', aliases: ['benzophenone-3', 'benzophenone 3', 'oxybenzone'] },
  { target: 'Coal Tar', aliases: ['coal tar', 'katran', 'pix lithanthracis'] },
  { target: 'Butylated Hydroxyanisole', aliases: ['butylated hydroxyanisole', 'BHA (preservative)', 'E320'] },
  { target: 'Butylated Hydroxytoluene', aliases: ['butylated hydroxytoluene', 'BHT', 'E321'] },
  { target: 'Diethyl Phthalate', aliases: ['diethyl phthalate', 'DEP'] },
  { target: 'Dibutyl Phthalate', aliases: ['dibutyl phthalate', 'DBP'] },
  { target: 'Di(2-Ethylhexyl) Phthalate', aliases: ['di(2-ethylhexyl) phthalate', 'DEHP', 'diethylhexyl phthalate'] },
  { target: 'Lead Acetate', aliases: ['lead acetate', 'plumbum aceticum'] },
  { target: 'Mercury', aliases: ['mercury', 'civa', 'thimerosal'] },
  { target: 'Resorcinol', aliases: ['resorcinol', 'rezorsinol'] },
  { target: 'p-Phenylenediamine', aliases: ['p-phenylenediamine', 'PPD', 'para-phenylenediamine'] },
  { target: 'Chamomilla Recutita Flower Extract', aliases: ['chamomilla recutita', 'matricaria', 'papatya'] },
  { target: 'Rosa Canina Fruit Oil', aliases: ['rosa canina', 'kuşburnu yağı', 'rosehip'] },
  { target: 'Avena Sativa Kernel Extract', aliases: ['avena sativa', 'oat kernel', 'yulaf'] },
  { target: 'Polyacrylamide', aliases: ['polyacrylamide', 'poliakrilamid'] },
  { target: 'Salicyloyl Phytosphingosine', aliases: ['salicyloyl phytosphingosine'] },
  { target: 'Behentrimonium Methosulfate', aliases: ['behentrimonium methosulfate'] },
  { target: 'Colloidal Sulfur', aliases: ['colloidal sulfur', 'colloidal sulphur', 'kolloidal kükürt'] },
];

async function findMatch(client, aliases) {
  const hits = [];
  for (const a of aliases) {
    const res = await client.query(
      `SELECT ingredient_id, ingredient_slug, inci_name, common_name
         FROM ingredients
        WHERE inci_name ILIKE $1 OR common_name ILIKE $1 OR ingredient_slug ILIKE $2
        LIMIT 3`,
      [`%${a}%`, `%${a.toLowerCase().replace(/\s+/g, '-')}%`],
    );
    for (const row of res.rows) {
      if (!hits.find((h) => h.ingredient_id === row.ingredient_id)) {
        hits.push({ ...row, matched_alias: a });
      }
    }
    if (hits.length >= 3) break;
  }
  return hits;
}

async function main() {
  const APPLY = process.argv.includes('--apply');

  const client = new Client({
    host: 'ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_0KZrPGQxqH5d',
    database: 'neondb',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    console.log('\n═══ SUPPLEMENT MATCH REPORT ═══\n');
    const supplementUpdates = [];
    for (const s of MISSING_SUPPLEMENTS) {
      const hits = await findMatch(client, s.aliases);
      if (hits.length === 0) {
        console.log(`  [NO MATCH] ${s.slug}`);
      } else {
        const best = hits[0];
        console.log(`  [${s.slug}] → id=${best.ingredient_id} slug=${best.ingredient_slug} name="${best.inci_name}" (via "${best.matched_alias}")`);
        if (best.ingredient_slug !== s.slug) {
          supplementUpdates.push({ current_slug: best.ingredient_slug, target_slug: s.slug, id: best.ingredient_id });
        }
      }
    }

    console.log('\n═══ COSMETIC MATCH REPORT ═══\n');
    const cosmeticUpdates = [];
    for (const c of MISSING_COSMETICS) {
      const hits = await findMatch(client, c.aliases);
      if (hits.length === 0) {
        console.log(`  [NO MATCH] ${c.target}`);
      } else {
        const best = hits[0];
        const targetSlug = c.target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        console.log(`  [${c.target}] → id=${best.ingredient_id} slug=${best.ingredient_slug} name="${best.inci_name}" (via "${best.matched_alias}")`);
        if (best.inci_name.toLowerCase() !== c.target.toLowerCase()) {
          cosmeticUpdates.push({ id: best.ingredient_id, current_inci: best.inci_name, target_inci: c.target });
        }
      }
    }

    if (!APPLY) {
      console.log(`\n=== DRY RUN ===`);
      console.log(`  ${supplementUpdates.length} supplement slug rename candidate`);
      console.log(`  ${cosmeticUpdates.length} cosmetic alias candidate`);
      console.log(`\n  Re-run with --apply to write slug aliases.`);
      return;
    }

    console.log('\n=== APPLYING SLUG RENAMES (supplement) ===');
    for (const u of supplementUpdates) {
      await client.query(
        `UPDATE ingredients SET ingredient_slug = $1 WHERE ingredient_id = $2 AND NOT EXISTS (SELECT 1 FROM ingredients WHERE ingredient_slug = $1 AND ingredient_id != $2)`,
        [u.target_slug, u.id],
      );
      console.log(`  ${u.current_slug} → ${u.target_slug} (id=${u.id})`);
    }

    console.log('\n=== DONE ===');
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
