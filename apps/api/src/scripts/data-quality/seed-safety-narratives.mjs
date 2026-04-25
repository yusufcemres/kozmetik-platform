/**
 * Sprint 2 (#14) — Tartışmalı/regülasyonlu ingredient'lar için safety_narrative seed.
 *
 * Bilinen flagged içerikler için kanıta dayalı kısa Türkçe açıklamalar.
 * - SCCS (Scientific Committee on Consumer Safety, EU) görüşleri
 * - IARC (International Agency for Research on Cancer) sınıfları
 * - EU Regülasyon 1223/2009 Annex II (yasaklı) / Annex III (kısıtlı) atıfları
 * - CIR (Cosmetic Ingredient Review, US) kararları
 *
 * Idempotent: sadece NULL/'' olan satırları doldurur.
 *
 * Kullanım: node src/scripts/data-quality/seed-safety-narratives.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Slug → narrative + controversy_summary
// Source bilgileri: SCCS, EU 1223/2009, IARC, CIR, NIH PubChem.
const NARRATIVES = {
  // === Parabenler ===
  'methylparaben': {
    summary: 'Endokrin bozucu şüphesi taşıyan, EU\'da %0.4\'e kadar kısıtlı kullanımı olan koruyucu.',
    narrative: `**Methylparaben — Güvenlik Profili**

Methylparaben, kozmetiklerde yaygın kullanılan bir koruyucudur. EU 1223/2009 Annex V'te %0.4 (tek başına) ve %0.8 (toplam paraben) kısıtlamasıyla onaylıdır.

**Tartışma noktası:** Östrojen reseptörlerine bağlanma kapasitesi laboratuvar deneylerinde gösterilmiştir (zayıf etki). SCCS 2013 raporu (SCCS/1514/13) güncel kullanımın güvenli olduğunu doğrulamıştır.

**Pratik:** Methylparaben'in alerjisi varsa kaçın, aksi halde yıkanan ürünlerde sorun değildir. Kalıcı temaslı (krem, makyaj) ürünlerde bilinçli kullanıcılar paraben-free tercih edebilir.`,
  },
  'ethylparaben': {
    summary: 'Methylparaben gibi onaylı ama düşük östrojenik aktivite şüphesi taşıyan koruyucu.',
    narrative: `**Ethylparaben — Güvenlik Profili**

Ethylparaben, EU'da onaylı ve %0.4 toplam paraben sınırı altında kullanılan koruyucudur (1223/2009 Annex V).

**Tartışma:** Methylparaben gibi zayıf östrojenik aktivite gösterir. SCCS güncel kullanımı güvenli kabul etmiştir.

**Pratik:** Hassas ciltlerde test edilmesi önerilir. Kompleks bakım rutini çıkıyorsa paraben-free alternatif olarak phenoxyethanol veya pentanediol seçilebilir.`,
  },
  'propylparaben': {
    summary: 'EU\'da kısıtlı (%0.14), endokrin sistem etkisi nedeniyle Danimarka\'da çocuk ürünlerinde yasak.',
    narrative: `**Propylparaben — Güvenlik Profili**

Propylparaben, daha uzun zincirli bir paraben'dir. EU 1223/2009 Annex V güncellemesiyle %0.14 ile sınırlanmıştır (eskiden %0.4).

**Tartışma:** Daha güçlü östrojenik aktivite gösterir; SCCS 2013 raporu uyarınca pediyatrik temaslı ürünlerde sınırlama getirildi. Danimarka 3 yaş altı çocuk ürünlerinde tamamen yasaklamıştır.

**Pratik:** Çocuk veya hassas cilt ürünlerinde tercih edilmemeli. Yetişkin yıkanan ürünlerde sorun değildir.`,
  },
  'butylparaben': {
    summary: 'EU\'da %0.14 kısıtlı, en güçlü östrojenik aktivite gösteren paraben — gebelik/çocuk için kaçınılması önerilir.',
    narrative: `**Butylparaben — Güvenlik Profili**

Butylparaben, paraben ailesinin en uzun zincirli ve en güçlü östrojenik aktivite gösteren üyesidir. EU 1223/2009 Annex V'te %0.14 sınırlıdır.

**Tartışma:** SCCS 2013 raporu (SCCS/1514/13) gebelik ve çocuk ürünlerinde kullanımının kısıtlanmasını önermiştir. Endokrin sistem üzerindeki olası etkiler in vivo çalışmalarda gözlenmiştir.

**Pratik:** Gebelik, emzirme ve 3 yaş altı çocuk ürünlerinde kaçının. Yetişkin yıkanan ürünlerde standart koruyucu olarak güvenli kabul edilir.`,
  },

  // === Isothiazolinones ===
  'methylisothiazolinone': {
    summary: 'Yüksek alerjen potansiyeli — EU\'da kalıcı temaslı ürünlerde yasak (yıkamada kalan %0.0015).',
    narrative: `**Methylisothiazolinone (MIT) — Güvenlik Profili**

MIT, güçlü antimikrobiyal koruyucu. EU 1223/2009:
- **Kalıcı temaslı ürünlerde (krem, losyon) yasak** (Annex II ekleme — 2017)
- **Yıkanan ürünlerde** %0.0015 (15 ppm) kısıtlı (Annex V)

**Tartışma:** Allergic Contact Dermatitis Society MIT'i 2013'te "Yılın Alerjeni" ilan etti. Bant testi pozitiflik oranı son yıllarda %5-10'a çıkmıştır.

**Pratik:** MIT'e karşı bilinen alerjisi olanlar etiketleri dikkatle okumalı. Şampuan/duş jeli gibi yıkanan ürünlerde modern formüllerde miktarlar düşürülmüştür.`,
  },
  'methylchloroisothiazolinone': {
    summary: 'MCI: MIT ile birlikte (Kathon CG) kullanılır, alerjen potansiyeli yüksek, EU\'da kısıtlı.',
    narrative: `**Methylchloroisothiazolinone (MCI) — Güvenlik Profili**

MCI, methylisothiazolinone (MIT) ile genelde 3:1 oranında kombinlenir (Kathon CG). EU 1223/2009 Annex V'te yıkanan ürünlerde 15 ppm sınırlı, kalıcı temaslı ürünlerde yasaktır.

**Tartışma:** MCI/MIT karışımı bilinen güçlü temas alerjeni. SCCS değerlendirmeleri sonucu kullanım kısıtlamaları 2010'lardan itibaren sıkılaştırılmıştır.

**Pratik:** Kontakt egzeması varsa kaçınılmalı. Yıkanan ürünlerde düşük konsantrasyonda tolere edilebilir.`,
  },
  'benzisothiazolinone': {
    summary: 'BIT: kozmetiklerde sınırlı kullanım, ev temizlik ürünlerinde sık. EU\'da kısıtlı.',
    narrative: `**Benzisothiazolinone (BIT) — Güvenlik Profili**

BIT, isothiazolinone ailesinden bir koruyucu. EU 1223/2009 Annex III ile kozmetiklerde yıkanan ürünlerde %0.0015 sınırlı, leave-on'da kullanım yasaktır (2020 güncelleme).

**Tartışma:** MIT/MCI kadar yaygın kullanılmasa da temas alerjeni potansiyeli vardır. Endüstriyel deterjan ve boya formülasyonlarında daha sık.

**Pratik:** Hassas ciltlerde irritasyon yapabilir. Kozmetik ürünlerinde varsa konsantrasyonu zaten çok düşüktür.`,
  },

  // === Triclosan ===
  'triclosan': {
    summary: 'Antibakteriyel — EU\'da diş macunu hariç çoğu kozmetikte yasak, FDA OTC sabunlarda yasakladı.',
    narrative: `**Triclosan — Güvenlik Profili**

Triclosan, geniş spektrumlu antibakteriyel ajan. EU 1223/2009 Annex V güncellemesi ile kozmetiklerde sınırlı (sadece diş macunu, vücut yıkama, deodorant, makyaj fırçası temizleyici, %0.2-0.3).

**Tartışma:** ABD FDA 2016'da OTC antibakteriyel sabun ve deodorantlarda triclosan kullanımını yasakladı (yeterli güvenlik kanıtı yok + antibiyotik direnci endişesi). Hayvan çalışmalarında tiroid hormonlarını etkilediği gösterildi.

**Pratik:** Tüketici antibakteriyel ürünlerinde triclosan içermeyen alternatifleri tercih etmeli. Diş hekimi tavsiyesiyle kullanılan triclosanlı diş macunu bireysel karar.`,
  },

  // === Formaldehyde + saliniciler ===
  'formaldehyde': {
    summary: 'IARC Grup 1 (insanda kanserojen) + EU\'da kozmetiklerde yasak. Sadece saliniciler düşük konsantrasyonda izinli.',
    narrative: `**Formaldehyde — Güvenlik Profili**

Formaldehyde, IARC Grup 1 sınıflandırılmış (insanda kesin kanserojen). EU 1223/2009 Annex II'de kozmetiklerde direkt kullanımı yasaktır.

**Tartışma:** SCCS değerlendirmeleri sonucu serbest formaldehyde kozmetiklerde tamamen yasaklandı. Ancak DMDM Hydantoin, Imidazolidinyl Urea gibi formaldehyde-saliniciler düşük konsantrasyonda Annex V kapsamında izinlidir.

**Pratik:** "Formaldehyde" etiketli ürün modern AB pazarında bulunmamalı. Formaldehyde-salinici koruyucu içeren ürünlerde hassas ciltler dikkatli olmalı.`,
  },
  'dmdm-hydantoin': {
    summary: 'Formaldehyde-salinici koruyucu — EU\'da %0.6 kısıtlı, hassas ciltlerde irritasyon yapabilir.',
    narrative: `**DMDM Hydantoin — Güvenlik Profili**

DMDM Hydantoin, yavaş formaldehyde salan bir koruyucu. EU 1223/2009 Annex V'te %0.6 ile kısıtlıdır. Etikette "formaldehyde içerebilir" uyarısı %0.05'in üstünde zorunludur.

**Tartışma:** Salınan eser formaldehyde, hassas kişilerde temas dermatiti yapabilir. SCCS değerlendirmesi mevcut sınırın güvenli olduğunu doğrulamıştır.

**Pratik:** Formaldehyde alerjisi/duyarlılığı varsa kaçının. Aksi halde modern düşük konsantrasyonlu formüllerde sorun değildir.`,
  },

  // === Phenoxyethanol & arkadaşları ===
  'phenoxyethanol': {
    summary: 'Yaygın paraben-alternatifi koruyucu, EU\'da %1 kısıtlı — düşük konsantrasyonda güvenli.',
    narrative: `**Phenoxyethanol — Güvenlik Profili**

Phenoxyethanol, paraben'lere alternatif olarak yaygın kullanılan koruyucudur. EU 1223/2009 Annex V'te %1 sınırlıdır.

**Tartışma:** Yüksek konsantrasyonlarda (>%1) ciltte irritasyon, ABD FDA'sının bebek emzirme ürünlerinde uyarısı (sadece anestezik etki riski). SCCS 2016 raporu mevcut sınırın güvenli olduğunu doğruladı.

**Pratik:** Paraben-free formüllerin standart koruyucusu. Bebek ürünlerinde dikkatli, yetişkin formüllerinde sorun değildir.`,
  },
  'sodium-benzoate': {
    summary: 'Doğal koruyucu (kuş üzümü, kızılcık) — EU\'da %2.5 kısıtlı, asit ile karışımda nitrosamin endişesi.',
    narrative: `**Sodium Benzoate — Güvenlik Profili**

Sodium Benzoate, doğal kaynaklı (kızılcık, erik) ya da sentetik bir koruyucu. EU 1223/2009 Annex V'te %2.5 (sürdürülebilir kullanım) ile sınırlıdır.

**Tartışma:** Vitamin C (Ascorbic Acid) ile karışımda eser miktarda benzene oluşumu hayvan çalışmalarında gözlendi. Kozmetikte güvenli, gıda paketleme regülasyonunda farklı düşünceler var.

**Pratik:** Sodium Benzoate + Ascorbic Acid içeren ürünleri yüksek sıcaklıkta saklamayın. Genel kullanımda güvenli.`,
  },
  'potassium-sorbate': {
    summary: 'Üvez böğürtleninden türetilen, gıda+kozmetikte yaygın güvenli koruyucu.',
    narrative: `**Potassium Sorbate — Güvenlik Profili**

Potassium Sorbate, üvez böğürtleninden türetilen ve sentetik üretilen güvenli koruyucudur. EU 1223/2009 Annex V'te %0.6 kısıtlıdır.

**Tartışma:** Önemli güvenlik endişesi yok. Hassas kişilerde nadiren mafsal tipi temas alerjisi.

**Pratik:** Cleanest preservative seçeneklerinden biri. "Free-from" etikette bulunsa da güvenli kabul edilir.`,
  },
  'benzyl-alcohol': {
    summary: 'Doğal/sentetik kombine koruyucu+çözücü — alerjen flagi (26 EU listesinde).',
    narrative: `**Benzyl Alcohol — Güvenlik Profili**

Benzyl Alcohol, doğal (yasemin, sümbül) ve sentetik kaynaklı çok fonksiyonlu maddedir. EU 1223/2009 Annex V'te %1 sınırlı koruyucu olarak; ayrıca EU 26 alerjen listesinde, %0.001 (yıkanan) / %0.01 (kalıcı) üzerinde "ingredients" listesinde belirtilmesi gerekir.

**Tartışma:** Yüksek konsantrasyonlarda ciltte irritasyon ve alerji. Bebek bakım ürünlerinde dikkatli kullanılmalı (toxicity raporları yenidoğan IV uygulamada).

**Pratik:** Topikal uygulamada güvenli; alerjisi olanlar etiketleri kontrol etmeli.`,
  },
  'chlorphenesin': {
    summary: 'Phenoxyethanol alternatifi — EU\'da %0.3 kısıtlı koruyucu.',
    narrative: `**Chlorphenesin — Güvenlik Profili**

Chlorphenesin, antimikrobiyal koruyucu. EU 1223/2009 Annex V'te %0.3 sınırlıdır.

**Tartışma:** Yüksek konsantrasyonlarda nadiren temas dermatiti. Genel olarak güvenli kabul edilir.

**Pratik:** Çoğunlukla phenoxyethanol ile birlikte kullanılır. Hassas ciltlerde test önerilir.`,
  },

  // === Cyclic siloxanes ===
  'cyclopentasiloxane': {
    summary: 'D5 — endokrin bozucu şüphesi (PBT/vPvB), EU\'da leave-on personal care\'de %0.1 kısıtlı (2020).',
    narrative: `**Cyclopentasiloxane (D5) — Güvenlik Profili**

D5, ipeksi doku ve nem koruma sağlayan silikon türevi. EU 1223/2009 Annex II güncellemesi (2020) ile leave-on (krem, deodorant) ürünlerde %0.1 sınırlıdır — biyobirikim (PBT/vPvB) endişesi nedeniyle çevresel.

**Tartışma:** Özellikle çevresel persistance endişesi (REACH değerlendirmesi). İnsan sağlığı için hayvan çalışmalarında tartışmalı endokrin etkiler. Yıkanan ürünlerde sınırlama yok.

**Pratik:** Yüzme, balık tüketimi gibi çevresel maruziyet düşünenler kaçınabilir. Temel cilt sağlığı için riskli değildir.`,
  },
  'cyclohexasiloxane': {
    summary: 'D6 — D5 ile birlikte sınırlanan silikon, EU leave-on \'%0.1 kısıtlı.',
    narrative: `**Cyclohexasiloxane (D6) — Güvenlik Profili**

D6, D5'in homoloğu silikon türevi. EU 1223/2009 Annex II (2020 güncelleme) ile leave-on personal care ürünlerinde %0.1 sınırlıdır.

**Tartışma:** D5 ile aynı: biyobirikim (PBT/vPvB) endişesi.

**Pratik:** Çevresel etki konusunda hassasiyet gösterenler kaçınabilir. Cilt için akut güvenlik endişesi yoktur.`,
  },

  // === Diğer ===
  'zinc-pyrithione': {
    summary: 'Anti-kepek aktif — EU\'da kozmetik koruyucu kullanımı 2022\'de yasaklandı (CMR), sadece OTC ilaç.',
    narrative: `**Zinc Pyrithione — Güvenlik Profili**

Zinc Pyrithione, anti-kepek (anti-fungal) aktif madde. EU 1223/2009 kapsamında kozmetiklerde koruyucu olarak 2022'de yasaklandı (CMR sınıflaması — toksik üreme).

**Tartışma:** AB'de kozmetik anti-kepek olarak hala onaylı (Annex V) ama koruyucu olarak değil. ABD'de OTC anti-fungal olarak yaygın kullanılmaya devam ediyor.

**Pratik:** Kepek için tedavi amaçlı kısa süreli kullanım kabul edilir. Uzun vadeli günlük şampuanda alternatif tercih edilebilir (piroctone olamine, ketoconazole).`,
  },
  'piroctone-olamine': {
    summary: 'Zinc Pyrithione alternatifi anti-kepek — EU\'da %0.5 (yıkanan) / %0.05 (leave-on) sınırlı.',
    narrative: `**Piroctone Olamine — Güvenlik Profili**

Piroctone Olamine, anti-fungal/anti-kepek aktif. EU 1223/2009 Annex V'te yıkanan %0.5, leave-on %0.05 kısıtlıdır.

**Tartışma:** Önemli güvenlik endişesi yok; Zinc Pyrithione yasağı sonrası ana alternatif olarak öne çıktı.

**Pratik:** Anti-kepek şampuanlarda standart aktif. Genel olarak iyi tolere edilir.`,
  },
  'triethanolamine': {
    summary: 'TEA: pH ayarlayıcı/emülsifiye — yüksek konsantrasyonda nitrosamin oluşumu endişesi, EU\'da kısıtlı.',
    narrative: `**Triethanolamine (TEA) — Güvenlik Profili**

TEA, kozmetiklerde pH ayarlayıcı ve emülsifiye edici. EU 1223/2009 Annex III'te %2.5 (leave-on) kısıtlıdır.

**Tartışma:** Nitrozlanabilir aminlerle (nitrit kaynaklı) reaksiyonu nitrosamine (NDELA) oluşturabilir — bu maddeler IARC Grup 2B (insanda olası kanserojen). Modern formüllerde nitrit kontaminasyonu engellenir.

**Pratik:** Cilt aktifleri arasında öncelikli kaçınma sebebi yok; kompleks bakım rutini olanlar dikkat edebilir.`,
  },
  'ci-77891': {
    summary: 'Titanyum Dioksit (TiO2) — IARC Grup 2B (inhalasyon yoluyla), kozmetikte topical güvenli.',
    narrative: `**CI 77891 (Titanium Dioxide) — Güvenlik Profili**

Titanium Dioxide, beyaz pigment ve UV filtresi. EU 1223/2009 Annex IV'te onaylı renklendirici, Annex VI'da %25 sınırlı UV filtresi.

**Tartışma:** IARC inhalasyon yoluyla maruziyet için Grup 2B (insanda olası kanserojen) sınıflandırdı. Topikal (deri) kullanımda güvenli kabul edilir. Spray/pudra ürünlerde respirable parçacık endişesi mevcut.

**Pratik:** Krem, ruj, mineral makyajda güvenli. Spray güneş kremi veya pudra ruj kullanırken inhalasyondan kaçının.`,
  },
  'butylphenyl-methylpropional': {
    summary: 'Lilial — EU\'da CMR Class 1B nedeniyle 2022\'den itibaren yasak.',
    narrative: `**Butylphenyl Methylpropional (Lilial) — Güvenlik Profili**

Lilial, parfüm bileşeni (vadi zambağı kokusu). EU 1223/2009 Annex II eklemesi (2022) ile CMR Class 1B (üreme toksisitesi şüphesi) nedeniyle tamamen yasaklandı.

**Tartışma:** REACH değerlendirmesi sonucu kaldırıldı. Eski stoklar 2022 sonrası satılmamalı.

**Pratik:** Modern AB pazarında bulunmamalı. Eski ürünlerde varsa kullanmayın.`,
  },
  'toluene': {
    summary: 'Oje incelticisi — EU\'da %25 kısıtlı, üreme toksisitesi şüphesi (CMR Class 2).',
    narrative: `**Toluene — Güvenlik Profili**

Toluene, oje ve nail removerlarda solvent. EU 1223/2009 Annex III'te %25 sınırlı (sadece tırnak ürünleri). CMR Class 2 (üreme/gelişim toksisitesi şüphesi).

**Tartışma:** Gebelik döneminde inhalasyon maruziyeti sinir sistemi gelişimi için risk. Ojeler oda havalandırması yetersizse mesleki maruziyet de sorun.

**Pratik:** Gebe ve emziren dönemde kaçının. Salonda manikür yaptırırken iyi havalandırılan alan tercih edin.`,
  },
  'tretinoin': {
    summary: 'Retinoik asit — EU\'da reçeteli ilaç, kozmetikte yasak; ABD\'de OTC topikal akne tedavisi.',
    narrative: `**Tretinoin (All-trans Retinoic Acid) — Güvenlik Profili**

Tretinoin, A vitamini'nin asit formu — güçlü topikal anti-akne/anti-aging molekülü. EU'da kozmetik kullanımı yasak (sadece reçeteli ilaç olarak), ABD'de OTC kullanımı vardır.

**Tartışma:** Gebelik kategorisi C/D — teratojenik risk (yutarsanız). Topikal kullanımda da gebelikte kaçınılması önerilir. İrritasyon, kuruluk, foto-hassasiyet sık.

**Pratik:** Gebelikte tamamen kaçının. Reçetesiz "tretinoin" iddiası taşıyan kozmetikler yasal değildir; muhtemelen retinol veya retinaldehyde içerir.`,
  },
};

// Generic fallback templates for ingredients not in NARRATIVES map
function genericNarrative(row) {
  const flags = [];
  if (row.eu_banned) flags.push('AB\'de yasaklı');
  if (row.eu_restricted) flags.push('AB\'de kısıtlı kullanım');
  if (row.endocrine_flag) flags.push('endokrin bozucu şüphesi');
  if (row.cmr_class) flags.push(`CMR Sınıf ${row.cmr_class}`);
  if (row.iarc_group) flags.push(`IARC Grup ${row.iarc_group}`);
  if (row.allergen_flag) flags.push('alerjen');

  const flagText = flags.join(', ');
  return {
    summary: `${row.inci_name}: ${flagText}.`,
    narrative: `**${row.inci_name} — Güvenlik Profili**

Bu içerik şu regülasyon/kanıt sınıflarındadır: ${flagText}.

**Tartışma:** Tam regülasyon detayları için ilgili otoritenin (SCCS, ECHA, IARC, EU 1223/2009) güncel görüşüne bakılmalıdır. Bu yüzden REVELA, içeriği "Tartışmalı" olarak işaretler.

**Pratik:** Hassas cilt, gebelik veya bilinen alerji durumunda kaçınılması önerilir. Genel topikal kullanımda kısıtlamalar dahilinde güvenli kabul edilir; ancak alternatif varsa tercih edilebilir.`,
  };
}

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
    const r = await client.query(`
      SELECT ingredient_id, ingredient_slug, inci_name, common_name,
             endocrine_flag, cmr_class, iarc_group, eu_banned, eu_restricted, allergen_flag
      FROM ingredients
      WHERE (endocrine_flag = true OR cmr_class IS NOT NULL OR iarc_group IS NOT NULL
             OR eu_banned = true OR eu_restricted = true)
        AND (safety_narrative IS NULL OR safety_narrative = '')
      ORDER BY ingredient_id
    `);
    const rows = r.rows;
    console.log(`Found ${rows.length} flagged ingredients without safety_narrative`);

    let withNarrative = 0;
    let withGeneric = 0;
    const plan = [];
    for (const row of rows) {
      const slug = row.ingredient_slug;
      const known = NARRATIVES[slug];
      const data = known || genericNarrative(row);
      if (known) withNarrative++; else withGeneric++;
      plan.push({ id: row.ingredient_id, slug, data });
    }

    console.log(`Plan: ${withNarrative} bespoke + ${withGeneric} generic narratives`);

    if (!apply) {
      console.log('--- DRY-RUN ---');
      for (const p of plan.slice(0, 5)) {
        console.log(`${p.slug}: ${p.data.summary}`);
      }
      console.log('Re-run with --apply to write.');
      return;
    }

    await client.query('BEGIN');
    let updated = 0;
    for (const p of plan) {
      await client.query(
        `UPDATE ingredients
         SET safety_narrative = $1,
             controversy_summary = COALESCE(controversy_summary, $2)
         WHERE ingredient_id = $3`,
        [p.data.narrative, p.data.summary, p.id],
      );
      updated++;
    }
    await client.query('COMMIT');
    console.log(`OK: ${updated} rows updated`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Failed:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
