import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Yanlış görselli Shiseido ürünleri bul
const { rows: targets } = await client.query(`
  SELECT
    p.product_id, p.product_name, p.status,
    pi.image_id, pi.image_url,
    pi.source,
    (SELECT COUNT(*) FROM product_ingredients pi2 WHERE pi2.product_id = p.product_id AND pi2.match_confidence = 85) as obf_inci_count
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.product_id
  WHERE p.product_name ILIKE '%lait bronzant%'
     OR p.product_name ILIKE '%expert anti-age solaire%'
     OR p.product_name ILIKE '%anti-age solaire%'
  ORDER BY p.product_name, pi.image_id
`);

console.log('Targets:');
targets.forEach(r => console.log(
  `  #${r.product_id} [${r.status}] ${r.product_name}\n    img_id:${r.image_id} url:${r.image_url?.substring(0, 80)} src:${r.source} obf_inci:${r.obf_inci_count}`
));

if (targets.length === 0) {
  console.log('No targets found.');
  await client.end();
  process.exit(0);
}

const productIds = [...new Set(targets.map(r => r.product_id))];

// 1. Yanlış OBF görsellerini sil
const { rowCount: imgDeleted } = await client.query(`
  DELETE FROM product_images
  WHERE product_id = ANY($1::int[])
    AND source ILIKE '%openbeautyfacts%'
`, [productIds]);
console.log(`\n✓ Deleted ${imgDeleted} OBF images`);

// 2. OBF INCI'lerini de sil (match_confidence=85 = OBF import)
const { rowCount: inciDeleted } = await client.query(`
  DELETE FROM product_ingredients
  WHERE product_id = ANY($1::int[])
    AND match_confidence = 85
`, [productIds]);
console.log(`✓ Deleted ${inciDeleted} OBF INCI rows`);

// 3. Görselsiz + INCI'siz kaldıysa archived'e al, INCI'si varsa draft'a
for (const pid of productIds) {
  const { rows: imgCount } = await client.query(
    `SELECT COUNT(*) as cnt FROM product_images WHERE product_id = $1`, [pid]
  );
  const { rows: inciCount } = await client.query(
    `SELECT COUNT(*) as cnt FROM product_ingredients WHERE product_id = $1`, [pid]
  );
  const hasImg = parseInt(imgCount[0].cnt) > 0;
  const hasInci = parseInt(inciCount[0].cnt) > 0;
  const newStatus = (!hasImg || !hasInci) ? 'archived' : 'draft';
  await client.query(
    `UPDATE products SET status = $1, updated_at = NOW() WHERE product_id = $2`,
    [newStatus, pid]
  );
  console.log(`  #${pid} → ${newStatus} (img:${hasImg} inci:${hasInci})`);
}

await client.end();
console.log('\nDone.');
