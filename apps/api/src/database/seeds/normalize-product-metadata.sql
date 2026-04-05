-- Normalize product_type_label, target_area, usage_time_hint
-- Run against Railway PG: 2026-04-06

BEGIN;

-- === product_type_label: Case + merge ===
-- Step 1: Case normalization
UPDATE products SET product_type_label = 'ampul' WHERE product_type_label = 'Ampul';
UPDATE products SET product_type_label = 'temizleme yağı' WHERE product_type_label = 'Temizleme Yağı';
UPDATE products SET product_type_label = 'misel su' WHERE product_type_label IN ('Misel Su', 'micellar su');
UPDATE products SET product_type_label = 'losyon' WHERE product_type_label IN ('Losyon', 'Vücut Losyonu');
UPDATE products SET product_type_label = 'fondöten' WHERE product_type_label = 'Fondöten';
UPDATE products SET product_type_label = 'eksfoliant' WHERE product_type_label = 'Eksfoliant';
UPDATE products SET product_type_label = 'jel' WHERE product_type_label = 'Jel';
UPDATE products SET product_type_label = 'primer' WHERE product_type_label = 'Primer';
UPDATE products SET product_type_label = 'şampuan' WHERE product_type_label = 'Şampuan';
UPDATE products SET product_type_label = 'el kremi' WHERE product_type_label = 'El Kremi';
UPDATE products SET product_type_label = 'mist' WHERE product_type_label = 'Mist';
UPDATE products SET product_type_label = 'booster' WHERE product_type_label = 'Booster';
UPDATE products SET product_type_label = 'dudak bakım' WHERE product_type_label IN ('Dudak Bakım', 'Dudak Yağı', 'Yağ Tint');
UPDATE products SET product_type_label = 'sheet maske' WHERE product_type_label = 'Sheet Maske';
UPDATE products SET product_type_label = 'peeling' WHERE product_type_label IN ('Peeling Ped', 'eksfoliant');
UPDATE products SET product_type_label = 'tonik' WHERE product_type_label = 'Tonik Pad';
UPDATE products SET product_type_label = 'göz kremi' WHERE product_type_label IN ('Göz Serumu', 'Göz Maskesi');
UPDATE products SET product_type_label = 'yağ' WHERE product_type_label IN ('Yağ', 'yüz yağı', 'Kuru Yağ', 'Gece Yağı');

-- Step 2: Merge rare subtypes into main chips
UPDATE products SET product_type_label = 'krem' WHERE product_type_label IN (
  'Anti-Aging Krem', 'Bariyer Kremi', 'Bariyer Krem', 'Onarım Kremi',
  'Leke Kremi', 'Bakım Kremi', 'Yatıştırıcı Krem', 'Sivilce Kremi',
  'Jel Nemlendirici', 'BB Krem', 'CC Krem', 'Renkli Nemlendirici',
  'vücut kremi', 'onarıcı', 'bakım', 'jel', 'losyon', 'el kremi',
  'Cilt Tinti', 'vücut losyonu'
);
UPDATE products SET product_type_label = 'serum' WHERE product_type_label IN (
  'ampul', 'booster', 'Tonik Serum', 'Yağ Serum', 'Güneş Serumu',
  'Saç Serumu', 'Emülsiyon', 'mist', 'yağ'
);
UPDATE products SET product_type_label = 'temizleyici' WHERE product_type_label IN (
  'temizleme yağı', 'balsam', 'misel su', 'Temizleme Balmı',
  'Duş Yağı', 'Bariyer Balmı', 'şampuan'
);
UPDATE products SET product_type_label = 'güneş kremi' WHERE product_type_label = 'güneş stick';
UPDATE products SET product_type_label = 'maske' WHERE product_type_label IN ('sheet maske', 'Sivilce Tedavi', 'Gece Bakımı');
UPDATE products SET product_type_label = 'fondöten' WHERE product_type_label IN ('primer', 'Deodorant');

-- === target_area: Already Turkish, no changes needed ===
-- yüz (1639), göz (73), yüz_vücut (38), vücut (29), dudak (17), el (10), saç (6)

-- === usage_time_hint: Already Turkish, no changes needed ===
-- sabah_aksam (1150), aksam (340), sabah (322)

COMMIT;

-- Final result: 13 categories
-- serum (521), krem (324), temizleyici (224), nemlendirici (201),
-- güneş kremi (171), tonik (111), NULL (91), maske (76),
-- göz kremi (71), peeling (58), esans (25), dudak bakım (18), fondöten (12)
