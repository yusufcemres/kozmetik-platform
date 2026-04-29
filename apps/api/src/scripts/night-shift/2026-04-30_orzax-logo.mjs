// Orzax marka logosu — Clearbit denemesi + manuel
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Orzax için olası logo kaynakları (sırayla dene):
const candidates = [
  'https://logo.clearbit.com/orzax.com',
  'https://logo.clearbit.com/orzax.com.tr',
];

let foundUrl = null;
for (const url of candidates) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) {
      foundUrl = url;
      console.log(`✓ Bulundu: ${url}`);
      break;
    } else {
      console.log(`✗ ${url} → ${res.status}`);
    }
  } catch (e) {
    console.log(`✗ ${url} → ${e.message}`);
  }
}

if (foundUrl) {
  await c.query(`UPDATE brands SET logo_url = $1, updated_at = NOW() WHERE brand_slug = 'orzax'`, [foundUrl]);
  console.log(`brands.orzax.logo_url updated`);
} else {
  // Fallback: yerel SVG referansı (frontend public/logos/ altına)
  const fallback = '/logos/orzax.svg';
  await c.query(`UPDATE brands SET logo_url = $1, updated_at = NOW() WHERE brand_slug = 'orzax'`, [fallback]);
  console.log(`Fallback yerel logo: ${fallback} (frontend public/logos/orzax.svg dosyası eklenmeli)`);
}

await c.end();
