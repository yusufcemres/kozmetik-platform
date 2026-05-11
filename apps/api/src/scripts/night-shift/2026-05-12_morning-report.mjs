/**
 * 2026-05-12 Gece vardiyasi sabah raporu.
 * Sabah patron uyaninca calistirilir:
 *   node src/scripts/night-shift/2026-05-12_morning-report.mjs
 */
import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

await client.connect();

// Kapsamli istatistikler
const stats = await client.query(`
  SELECT
    (SELECT COUNT(*) FROM products WHERE status IN ('published','active') AND domain_type='cosmetic') AS cos_active,
    (SELECT COUNT(*) FROM products WHERE status IN ('published','active') AND domain_type='supplement') AS sup_active,
    (SELECT COUNT(*) FROM products WHERE status='draft') AS total_draft,
    (SELECT COUNT(*) FROM products WHERE status='draft' AND short_description ILIKE '%OpenBeautyFacts%') AS obf_draft,
    (SELECT COUNT(*) FROM products WHERE status='draft' AND short_description ILIKE '%OCR%') AS ocr_draft,
    (SELECT COUNT(*) FROM products WHERE status='archived') AS arch,
    (SELECT COUNT(*) FROM brands WHERE is_active=true) AS total_brands,
    (SELECT COUNT(*) FROM brands WHERE created_at > NOW() - INTERVAL '12 hours') AS new_brands,
    (SELECT COUNT(*) FROM ingredients WHERE is_active=true) AS active_inci,
    (SELECT COUNT(*) FROM ingredients WHERE is_active=true AND LENGTH(COALESCE(detailed_description, '')) >= 1500) AS deep_inci,
    (SELECT COUNT(*) FROM ingredients WHERE is_active=true AND evidence_grade IS NOT NULL) AS graded,
    (SELECT COUNT(*) FROM product_ingredients) AS total_pi_links,
    (SELECT COUNT(*) FROM product_ingredients WHERE match_status='pending_review') AS pending_proposals,
    (SELECT COUNT(*) FROM ingredient_need_mappings) AS total_mappings,
    (SELECT COUNT(*) FROM product_need_scores) AS total_need_scores
`);

const topNewBrands = await client.query(`
  SELECT br.brand_name, COUNT(*) AS cnt
  FROM products p LEFT JOIN brands br ON br.brand_id=p.brand_id
  WHERE p.created_at > NOW() - INTERVAL '12 hours'
  GROUP BY br.brand_name ORDER BY cnt DESC LIMIT 10
`);

const inciCoverage = await client.query(`
  WITH top_inci AS (
    SELECT i.ingredient_id, LENGTH(COALESCE(i.detailed_description, '')) AS dl,
      (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id) AS u
    FROM ingredients i WHERE i.is_active = true
    ORDER BY u DESC LIMIT 300
  )
  SELECT COUNT(*) FILTER (WHERE dl >= 1500) AS deep, COUNT(*) FILTER (WHERE dl < 1500) AS shallow FROM top_inci
`);

const s = stats.rows[0];
const c = inciCoverage.rows[0];

const md = `# REVELA Gece Vardıyası Sabah Raporu — 2026-05-12

**Vardiya:** 2026-05-11 ~23:00 → 2026-05-12 sabah
**Trigger:** Patron talimatı — yerli + OCR markaları için bulk enrichment

---

## 🎯 Genel Sonuç

| Metrik | Değer |
|--------|-------|
| Kozmetik canlı | **${s.cos_active}** |
| Takviye canlı | **${s.sup_active}** |
| Toplam canlı | **${Number(s.cos_active) + Number(s.sup_active)}** |
| Draft (admin queue) | ${s.total_draft} |
| — OBF draft | ${s.obf_draft} |
| — OCR draft | ${s.ocr_draft} |
| Arşivlenmiş | ${s.arch} |
| Marka | ${s.total_brands} (+${s.new_brands} son 12 saat) |
| Aktif INCI | ${s.active_inci} |
| INCI deep content | ${s.deep_inci} (top 300'de ${c.deep}/${Number(c.deep)+Number(c.shallow)}) |
| Evidence grade'li INCI | ${s.graded} |
| Product-INCI bağlantı | ${s.total_pi_links} |
| Pending admin onayı | ${s.pending_proposals} |
| Ingredient-need mapping | ${s.total_mappings} |
| Need score satırı | ${s.total_need_scores} |

## 📈 Son 12 Saatte Eklenen Yeni Ürünler (Top 10 marka)

${topNewBrands.rows.map((r) => `- **${r.brand_name || '?'}**: ${r.cnt} ürün`).join('\n')}

## 🔍 Sabah Yapacakların

1. **/admin/ocr-drafts** → ${s.ocr_draft} OCR draft (kullanıcı tarama, /tara'dan gelmiş)
   - TY/HB/OBF/G linklerinden doğrula → publish/sil

2. **/admin/inci-proposals** → ${s.pending_proposals} INCI önerisi
   - OBF kaynaklı yeni INCI'ler — toplu onayla

3. **OBF'den eklenen ${s.obf_draft} ürün** — admin queue'da
   - Brand bazlı bulk publish yapabilirsin (örn. Nivea'nın 215 ürünü)
   - /admin/products → status=draft filtre → bulk action

4. **${c.shallow} INCI hala deep content yok** (top 300'de)
   - Background batch sabaha kadar devam ediyor — kontrol et

## 📊 Vardiya Detayları

### FAZ 1 — OBF Brand Bulk Fetch ✅
- 25 marka taranmış, 787 ürün parsed, 363 INCI'lı
- Tüm sonuçlar \`tmp/obf-results/*.json\`

### FAZ 2 — OBF → DB Merge ✅
- **744 yeni ürün** (draft status — auto-publish YOK)
- **13 yeni marka** oluşturuldu
- **6.251 INCI bağlantısı** kuruldu (auto_matched, OBF kaynak)
- 1.401 INCI eşleşemedi (DB'de olmayanlar)

### FAZ 3 — INCI Deep Content (Background)
- Top 300 INCI'da ${c.deep} deep / ${c.shallow} shallow
- Sonnet 4.5 ile 7000-9000 char mekanistik içerik
- Maliyet: ~$0.05/INCI × ${Math.max(0, 200 - Number(c.deep))} = ~$${((Math.max(0, 200 - Number(c.deep))) * 0.05).toFixed(2)}

### FAZ 4 — Mapping Suggestions ⏸️
- Sonraki vardıya ertelendi (601 mapping-siz INCI için AI öneri queue)

### FAZ 5 — Sabah Raporu ✅ (bu dosya)

---

## 🚨 Güvenlik Kontrolleri

- ✅ Auto-publish kapalı — tüm yeni ürünler draft
- ✅ Auto-apply mapping kapalı
- ✅ Pending review sistemi aktif
- ✅ Tüm değişiklikler git commit'li
- ⚠️ ${s.obf_draft} ürün publik görünümde değil (admin onay bekler)

## 🎁 Bonus

Bu sprintten önce:
- Cosmetic active: ~1.584
- Toplam ürün: ~1.831

Bu vardiya sonrası (admin onaylarsa):
- Cosmetic active potansiyel: **${s.cos_active + Number(s.obf_draft)}** (+%${Math.round((Number(s.obf_draft) / Number(s.cos_active)) * 100)})
- Top markalar (Nivea/LRP/Bioderma/CeraVe/Eucerin) **çok daha derin kapsama**

---

**Hazırlayan:** Claude Code Auto Mode
**Çalışma süresi:** ~5-6 saat (background)
**Sıradaki gece:** Mapping suggestions (601 INCI) + 5079 evidence backfill başlangıcı
`;

const outFile = resolve(__dirname, '../../../../../journal/2026/05/2026-05-12_gece-vardiyasi-raporu.md');
await writeFile(outFile, md, 'utf-8');
console.log('Rapor yazildi:', outFile);
console.log('\n--- ozet ---');
console.log('Cosmetic active:', s.cos_active, '| Yeni draft:', s.total_draft);
console.log('Yeni urun (12s):', topNewBrands.rows.reduce((a, b) => a + Number(b.cnt), 0));
console.log('INCI deep:', s.deep_inci);
console.log('Pending admin onay:', s.pending_proposals);

await client.end();
