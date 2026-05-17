/**
 * Ingredient noise audit — /icerikler sayfasındaki scrape artifacts'leri tara.
 *
 * 2026-05-17: 10436 madde içinde scraping noise var:
 *   - Telefon numarası (0639312644)
 *   - Miktar string (000 ppb, 0.40 fl, 100 Stearat)
 *   - Yabancı dil cümle (1 % d'ingrédients d'origine naturelle...)
 *   - Adres/website parçaları
 *
 * Bu script noise pattern'lerini sayar (silmez, sadece raporla).
 */
import { newClient } from '../onboarding/db';

type Pattern = { name: string; regex: string; example?: string };

const PATTERNS: Pattern[] = [
  { name: 'Sadece sayı',            regex: '^[0-9 .,\\-]+$', example: '0.40, 1030, 10090' },
  { name: 'Telefon (0XXX)',         regex: '^0[78][0-9]{8,}$', example: '0639312644' },
  { name: 'Miktar+birim',           regex: '^[0-9., ]+ ?(mg|ml|g|kg|l|ppb|fl|oz|mcg)\\b', example: '000 ppb, 0.40 fl' },
  { name: 'Numara+kelime',          regex: '^[0-9]{2,}[ -][A-Za-z]+$', example: '100 Stearate, 1030 Brussels' },
  { name: 'FR cümle',               regex: '(d.origine|sans huile|sans silicone|naturelle)', example: 'd origine naturelle' },
  { name: 'EN sentence (3+ word)',  regex: '^[A-Za-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+', example: 'tüm cümle' },
  { name: 'Trademark sembol',       regex: '(®|™|©)', example: 'NEM® / Matrixyl®' },
  { name: 'Website/URL',            regex: '(www\\.|http|\\.com|\\.tr)', example: 'www.brand.com' },
  { name: 'Şehir/ülke isimli',      regex: ' (Zagreb|Brussels|Paris|İstanbul|Köln|Berlin)\\b', example: '10090 Zagreb' },
  { name: 'Soru işareti/!/...',     regex: '[?!]', example: 'Hatalı!' },
  { name: 'Parantez içi yarım',     regex: '\\)\\s*$|\\(\\s*[^)]*$', example: 'unmatched parens' },
];

async function main(): Promise<void> {
  const client = newClient();
  await client.connect();

  console.log(`\n🧹 Ingredient noise audit (read-only)\n`);

  const total = await client.query<{ c: string }>(`SELECT COUNT(*) AS c FROM ingredients`);
  console.log(`  Toplam ingredient: ${total.rows[0].c}\n`);

  for (const p of PATTERNS) {
    const r = await client.query<{ c: string }>(
      `SELECT COUNT(*) AS c FROM ingredients WHERE inci_name ~* $1`,
      [p.regex],
    );
    const sample = await client.query<{ inci_name: string }>(
      `SELECT inci_name FROM ingredients WHERE inci_name ~* $1 LIMIT 3`,
      [p.regex],
    );
    console.log(`  ${p.name.padEnd(25)} → ${String(r.rows[0].c).padStart(5)} madde`);
    if (sample.rows.length > 0) {
      for (const s of sample.rows) {
        console.log(`      • "${s.inci_name.slice(0, 60)}"`);
      }
    }
  }

  // Toplam noise (en güvenli filter — bunları silmek güvenli)
  const noise = await client.query<{ c: string }>(`
    SELECT COUNT(*) AS c FROM ingredients
    WHERE inci_name ~* '^[0-9 .,\\-]+$'
       OR inci_name ~* '^0[78][0-9]{8,}$'
       OR inci_name ~* '^[0-9., ]+ ?(mg|ml|g|kg|l|ppb|fl|oz|mcg)\\b'
       OR inci_name ~* '(www\\.|http|\\.com|\\.tr)'
       OR inci_name ~* '(d.origine|sans huile|sans silicone|naturelle)'
  `);
  console.log(`\n  Yüksek güven noise (silinebilir): ${noise.rows[0].c} madde`);

  await client.end();
}

main().catch((e) => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
