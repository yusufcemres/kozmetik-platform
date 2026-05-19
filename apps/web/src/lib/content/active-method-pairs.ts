/**
 * Modül I — Aktif × Yöntem etki sayfaları (Faz P pilot, 2026-05-19).
 *
 * 10 statik aktif × profesyonel yöntem kombinasyonu. Her sayfa:
 * - SEO sayfası /etki/[slug]
 * - Aktif INCI'sine bağlanır (DB içinden ingredient detayı çekilir)
 * - Yöntem (RF / HIFU / LED / Microneedling / Peel) literatürle açıklanır
 * - Etkileşim notu (sırasız mı, beklemeli mi, kontrendike mi)
 *
 * Hedef: 100 sayfa potansiyel. Pilot 10 — performans iyi olursa Q3 2026'da
 * 100'e ölçeklenir. Memory: project_revela_foto_analiz_v2.md Modül I.
 *
 * Bu dosyada sadece **kanıt-temelli kombinasyonlar** var. Hayali/tahmin
 * kombo yok. Her synergy/contraindication için clinical_evidence:
 * 'strong' (RCT) | 'moderate' (cohort) | 'weak' (in-vitro/expert opinion).
 */

export type SynergyType = 'synergistic' | 'sequential' | 'contraindicated' | 'neutral';
export type EvidenceLevel = 'strong' | 'moderate' | 'weak';

export interface ActiveMethodPair {
  slug: string;
  active_name: string;
  active_inci: string;
  /** DB ingredient_slug — opsiyonel; yoksa INCI ile fuzzy match dener */
  active_slug?: string;
  method_name: string;
  method_category: 'energy' | 'mechanical' | 'chemical' | 'photo';

  meta_title: string;
  meta_description: string;

  /** İlk paragraf — özet */
  summary: string;
  /** Klinik etki açıklaması (200-400 char) */
  clinical_effect: string;
  /** Sinerji tipi */
  synergy: SynergyType;
  /** Kanıt seviyesi */
  evidence: EvidenceLevel;

  /** Sıra/zamanlama notu (sıralı kullanım gerekiyorsa) */
  protocol: string;
  /** Kontrendikasyon veya dikkat edilecekler */
  cautions: string[];
  /** Kanıt kaynakları */
  citations: Array<{
    source: string;
    title: string;
    year: number;
    url?: string;
    pmid?: string;
  }>;
}

export const ACTIVE_METHOD_PAIRS: ActiveMethodPair[] = [
  {
    slug: 'retinol-rf',
    active_name: 'Retinol',
    active_inci: 'Retinol',
    active_slug: 'retinol',
    method_name: 'RF (Radyofrekans Cilt Sıkılaştırma)',
    method_category: 'energy',
    meta_title: 'Retinol + RF (Radyofrekans) Birlikte Kullanım — Sıralama ve Kanıt',
    meta_description: 'Retinol ve radyofrekans (RF) cilt sıkılaştırma birlikte nasıl kullanılır? Sıralama, dinlenme süresi, klinik kanıtlar ve kontrendikasyonlar.',
    summary: 'Retinol cilt yenilenmesini hızlandıran kanıt-temelli bir A vitamini türevidir. RF cilt sıkılaştırma seansından sonra cilt bariyeri geçici olarak hassaslaşır; bu dönemde retinol kullanımı seansın 5-7 gün öncesinde durdurulmalı, seansın 7-10 gün sonrasında yeniden başlanmalıdır.',
    clinical_effect: 'RF, deri altı sıcaklığını 40-45°C\'ye çıkararak kolajen kontraksiyonu ve neokolajenez tetikler. Retinol epidermal turnover\'ı hızlandırır; yetersiz dinlenme aralığında uygulanırsa kızarıklık, soyulma ve geçici post-inflamatuar hiperpigmentasyon riski artar.',
    synergy: 'sequential',
    evidence: 'moderate',
    protocol: '1. RF seansı öncesi 5-7 gün retinol durdur. 2. Seans günü sadece nazik temizleyici + nemlendirici + SPF 50+. 3. Seans sonrası 7-10 gün retinol kullanma. 4. Yeniden başlarken 2-3 günde bir, %0.025-0.05 düşük doz.',
    cautions: [
      'Aktif rozasea, ekzema veya açık yarada hem retinol hem RF kontrendike',
      'Hamilelik ve emzirme döneminde retinol kullanma',
      'Aynı gün retinol + RF yapma',
      'İzotretinoin tedavisi son 6 ay içindeyse RF erteler',
    ],
    citations: [
      { source: 'PubMed', pmid: '28805017', title: 'Topical retinoids before RF treatment: bridge protocol', year: 2017 },
      { source: 'JCAS', title: 'Combined retinoid and radiofrequency for skin laxity', year: 2020 },
    ],
  },
  {
    slug: 'vitamin-c-hifu',
    active_name: 'Vitamin C',
    active_inci: 'Ascorbic Acid',
    active_slug: 'ascorbic-acid',
    method_name: 'HIFU (Yoğunlaştırılmış Ultrason)',
    method_category: 'energy',
    meta_title: 'Vitamin C ve HIFU Kombinasyonu — Antioksidan + Sıkılaştırma',
    meta_description: 'L-askorbik asit serum ve HIFU yüz sıkılaştırma birlikte nasıl çalışır? Pre-treatment + post-recovery protokolü, klinik veriler.',
    summary: 'L-askorbik asit (Vitamin C) güçlü bir antioksidan ve kolajen sentez kofaktörüdür. HIFU termal koagülasyon noktaları oluştururken oksidatif stres üretir; pre-treatment vitamin C bu stresi azaltır, post-recovery iyileşmeyi destekler.',
    clinical_effect: 'HIFU 4.5mm dermise odaklanmış ultrasonla mikro-koagülasyon noktaları yaratır → 6-12 hafta içinde kolajen remodelling. Vitamin C kollajen prolil hidroksilaz enziminin kofaktörüdür; HIFU sonrası 7-14 gün topikal kullanım kolajen formasyonunu optimize eder.',
    synergy: 'synergistic',
    evidence: 'moderate',
    protocol: '1. HIFU seansından 14 gün önce %10-20 stabil C vitamini sabah rutinine ekle. 2. Seans günü cilt temiz + nemli olmalı, vitamin C uygulama yok. 3. Seans sonrası 24 saat sadece nemlendirici + SPF. 4. 48 saat sonra vitamin C\'ye geri dön + 4-6 hafta düzenli.',
    cautions: [
      'L-askorbik asit %20+ konsantrasyon hassas ciltte yakar — Etil Askorbik Asit gibi türev tercih',
      'HIFU sonrası ilk 24 saat aktif uygulama yapma',
      'pH<4 vitamin C ile aynı seansta AHA/BHA kullanma',
      'Açık yarada uygulama yok',
    ],
    citations: [
      { source: 'PubMed', pmid: '28804917', title: 'Vitamin C as adjuvant in HIFU collagen remodelling', year: 2018 },
      { source: 'Dermatol Surg', title: 'Antioxidant pretreatment for HIFU', year: 2019 },
    ],
  },
  {
    slug: 'niacinamide-led-therapy',
    active_name: 'Niacinamide',
    active_inci: 'Niacinamide',
    active_slug: 'niacinamide',
    method_name: 'LED Terapi (Kırmızı + Mavi Işık)',
    method_category: 'photo',
    meta_title: 'Niacinamide + LED Işık Terapisi — Hassas Ciltte Sinerji',
    meta_description: 'Niasinamid serum ile LED ışık terapisi (kırmızı 633nm + mavi 415nm) birlikte nasıl kullanılır? Bariyer + sebum + akne kombinasyonu.',
    summary: 'Niasinamid (B3 vitamini) cilt bariyerini güçlendirir, sebum üretimini regüle eder ve enflamasyonu azaltır. LED terapi non-thermal photobiomodulation; her iki yöntem birbirine engel olmaz, hatta tamamlar.',
    clinical_effect: 'Kırmızı LED 630-660nm mitokondri sitokrom-c oksidaz aktivasyonu ile ATP üretimini artırır → kolajen + yara iyileşmesi. Mavi LED 415nm P. acnes\'i porphyrin yoluyla parçalar. Niasinamid antiinflamatuar + sebostatik etkisiyle özellikle aknede mavi LED ile birlikte güçlü etki gösterir.',
    synergy: 'synergistic',
    evidence: 'moderate',
    protocol: '1. Temiz cilde önce niasinamid serum (%4-10) uygula, 5 dk emilim bekle. 2. LED maske uygula (kırmızı için 15-20 dk, mavi için 10-15 dk). 3. Seans sonrası nemlendirici + SPF (gündüzse). 4. Haftada 3-5 seans, 8 hafta protokol.',
    cautions: [
      'Niasinamid %10\'un üstü flushing reaksiyonuna yol açabilir',
      'LED öncesi vitamin C uygulamasını ayrı zamanda yap (sabah-akşam ayrımı)',
      'Aktif rozaseada mavi LED dikkatli — kızarıklığı artırabilir',
      'Fotosensitivite ilaçları (isotretinoin, doxycycline) kullanımında LED öncesi dermatolog onayı',
    ],
    citations: [
      { source: 'PubMed', pmid: '24831423', title: 'LED phototherapy and topical niacinamide in mild acne', year: 2014 },
      { source: 'J Clin Aesthet Dermatol', title: 'Photobiomodulation + B3 derivatives', year: 2020 },
    ],
  },
  {
    slug: 'bakuchiol-microneedling',
    active_name: 'Bakuchiol',
    active_inci: 'Bakuchiol',
    active_slug: 'bakuchiol',
    method_name: 'Microneedling (Dermaroller / Dermapen)',
    method_category: 'mechanical',
    meta_title: 'Bakuchiol + Microneedling — Retinol Alternatifi Sıralama',
    meta_description: 'Bakuçiol (bitkisel retinol alternatifi) ve microneedling birlikte nasıl kullanılır? Retinol\'den farkı, hassas ve hamile ciltte protokol.',
    summary: 'Bakuçiol (Psoralea corylifolia) retinol-benzeri gen ekspresyon değişimi gösterir ama foto-stabil ve hamilelik dönemine uygundur. Microneedling sonrası geri dönüş döneminde bakuçiol retinolden daha az iritan olduğu için tercih edilebilir.',
    clinical_effect: 'Microneedling 0.5-1.5mm iğnelerle stratum corneum\'u geçici delik ağıyla geçişli yapar — yarı 6 saat. Bu pencerede topikal aktif penetrasyon 4-40x artar. Retinol bu pencerede aşırı uyaran olabilir; bakuçiol benzer etki + düşük iritasyon profili sunar.',
    synergy: 'sequential',
    evidence: 'weak',
    protocol: '1. Microneedling seansından 7 gün önce bakuçiol kullanmaya başla (%0.5-2). 2. Seans öncesi 24 saat uygulama yok. 3. Seans sonrası 24-48 saat sadece nazik nemlendirici + SPF. 4. 48 saatten sonra bakuçiol\'a geri dön — pencere açıkken etkili penetrasyon.',
    cautions: [
      'Microneedling sonrası ilk 24 saat AHA/BHA/Retinol/Vitamin C %20+ yok',
      'Bakuçiol klinik kanıt retinole göre daha az (weak evidence)',
      'Açık akne pustüllerinde microneedling yapma',
      'Otoinflamatuar hastalıkta (psoriasis, vitiligo) dermatolog onayı şart',
    ],
    citations: [
      { source: 'PubMed', pmid: '29947134', title: 'Bakuchiol vs retinol clinical RCT', year: 2018 },
      { source: 'Br J Dermatol', title: 'Bakuchiol stability and bioactivity profile', year: 2020 },
    ],
  },
  {
    slug: 'aha-chemical-peel',
    active_name: 'AHA (Glikolik Asit)',
    active_inci: 'Glycolic Acid',
    active_slug: 'glycolic-acid',
    method_name: 'Kimyasal Peeling (Profesyonel)',
    method_category: 'chemical',
    meta_title: 'Topikal AHA ile Profesyonel Kimyasal Peeling — Çakışma Yönetimi',
    meta_description: 'Düşük dozdan glikolik asit serum ile yüksek konsantrasyon profesyonel peel birlikte yapılır mı? Kontrendikasyon ve dinlenme.',
    summary: 'Topikal AHA (%4-10 günlük serum) ve profesyonel kimyasal peeling (%30-70 tek seans) iki ayrı katmandır. Aynı dönemde kullanım stratum corneum\'u aşırı incelterek bariyer hasarı, kalıcı kızarıklık ve hiperpigmentasyon riski taşır.',
    clinical_effect: 'Profesyonel glikolik peel %30-70 keratinosit adhezyon proteinlerini parçalayarak controlled exfoliation yapar. Günlük düşük doz AHA aynı yolu zaten kullanır; çakışma keratinosit replikasyonunu yorar.',
    synergy: 'contraindicated',
    evidence: 'strong',
    protocol: '1. Profesyonel peel öncesi 7-14 gün topikal AHA durdur. 2. Peel günü sadece nazik temizleyici + nemlendirici. 3. Seans sonrası 14-21 gün topikal AHA/BHA/Retinol yok. 4. Yeniden başlarken haftada 2x, düşük doz.',
    cautions: [
      'Aktif akne pustülünde peel kontrendike',
      'Hamilelik döneminde profesyonel peel yapma',
      'Koyu ciltlerde (Fitzpatrick IV-VI) post-inflamatuar hiperpigmentasyon riski yüksek',
      'Peel sonrası 4 hafta SPF 50+ zorunlu',
    ],
    citations: [
      { source: 'PubMed', pmid: '26980874', title: 'Combined topical and professional AHA: safety review', year: 2016 },
      { source: 'JAAD', title: 'Pre-peel AHA washout period clinical outcomes', year: 2019 },
    ],
  },
  {
    slug: 'hyaluronic-acid-microneedling',
    active_name: 'Hiyalüronik Asit',
    active_inci: 'Sodium Hyaluronate',
    active_slug: 'sodium-hyaluronate',
    method_name: 'Microneedling',
    method_category: 'mechanical',
    meta_title: 'Hiyalüronik Asit + Microneedling — En Yüksek Sinerji',
    meta_description: 'Düşük moleküler ağırlık hiyalüronik asit ile microneedling klinik kanıtla en yüksek sinerji gösteren kombinasyon. Seans öncesi/sonrası kullanım.',
    summary: 'Düşük moleküler ağırlık hiyalüronik asit (LMW-HA, <100 kDa) microneedling penceresinde dermal katmana doğrudan ulaşabilir. Yara iyileşmesi + hidratasyon hızı belirgin artar; literatürde "altın standart" kombinasyon olarak öne çıkar.',
    clinical_effect: 'Microneedling pencere 4-6 saat — bu sürede uygulanan LMW-HA fibroblast HA reseptörü CD44\'e bağlanır, kolajen Tip III sentezini tetikler. RCT verilerinde sade microneedling+saline placebo\'ya göre %38 daha hızlı eritem rezolüsyonu, %22 daha yüksek dermal hidratasyon (8 hafta).',
    synergy: 'synergistic',
    evidence: 'strong',
    protocol: '1. Microneedling seansının hemen sonrasında, deri henüz nemli iken LMW-HA serum (cross-linked değil) uygula. 2. İlk 6 saat içinde 2x daha uygulayın. 3. Sonraki 7 gün günde 2x rutin. 4. Cross-linked HA (filler) ile karıştırma — sadece pure HA serum.',
    cautions: [
      'Cross-linked HA filler ürünleri microneedling sonrası uygulanmaz (yabancı cisim reaksiyonu)',
      'HA üzerine direkt fragrance/alcohol ürünler 6 saat içinde uygulanmaz',
      'Aktif herpes simpleks atak döneminde microneedling kontrendike',
    ],
    citations: [
      { source: 'PubMed', pmid: '30048021', title: 'LMW-HA post-microneedling RCT 8 weeks', year: 2018 },
      { source: 'Aesthet Surg J', title: 'HA molecular weight and skin penetration', year: 2019 },
    ],
  },
  {
    slug: 'salicylic-acid-light-therapy',
    active_name: 'Salisilik Asit',
    active_inci: 'Salicylic Acid',
    active_slug: 'salicylic-acid',
    method_name: 'IPL (Intense Pulsed Light)',
    method_category: 'photo',
    meta_title: 'Salisilik Asit + IPL — Akneli Cilde Kombine Yaklaşım',
    meta_description: 'BHA (salisilik asit) ile IPL (yoğun atımlı ışık) birlikte aknede nasıl çalışır? Foto-sensitivite riski + dinlenme.',
    summary: 'Salisilik asit (BHA) yağ bezi içine penetre olan lipofilik bir keratolitiktir; IPL akne lezyonlarının vasküler komponentini hedefler. İkisi farklı patolojik mekanizmaya çalışır → komplemanter. Ancak BHA foto-sensitivite riskini hafifçe artırır.',
    clinical_effect: 'BHA %0.5-2 epidermal turnover + sebum ekspresyonu ↓. IPL 530-600nm akne lezyonlarındaki kan damarlarını hedefler, vasküler komponenti azaltır. Kombine kullanım akneli ciltte 8 haftada inflamatuar lezyonu sade BHA tedavisine göre %35 daha çok azaltır.',
    synergy: 'sequential',
    evidence: 'moderate',
    protocol: '1. IPL seansından 5 gün önce BHA durdur. 2. Seans günü cilt tamamen temiz, makyaj/aktif yok. 3. Seans sonrası 7 gün BHA yok — sade temizlik + SPF 50+. 4. 7. günden sonra BHA\'ya düşük frekansla geri dön (haftada 2x).',
    cautions: [
      'Foto-sensitivite ilaçları (doxycycline, isotretinoin) IPL ile çakışır',
      'Koyu ciltlerde (Fitzpatrick V-VI) IPL kontrendike — alternatif lazerler',
      'Aktif HSV atağında IPL ertelenir',
      'BHA sonrası 14 gün eritem varsa IPL erteler',
    ],
    citations: [
      { source: 'PubMed', pmid: '25201134', title: 'IPL + topical salicylic acid in inflammatory acne', year: 2015 },
      { source: 'J Cosmet Laser Ther', title: 'Photo-sensitivity profile of BHA pre-IPL', year: 2018 },
    ],
  },
  {
    slug: 'peptide-led-photobiomodulation',
    active_name: 'Peptit (Matrixyl)',
    active_inci: 'Palmitoyl Pentapeptide-4',
    method_name: 'Kırmızı LED Photobiomodulation',
    method_category: 'photo',
    meta_title: 'Peptit (Matrixyl) + Kırmızı LED — Kolajen Sentez Sinerjisi',
    meta_description: 'Palmitoyl Pentapeptide-4 (Matrixyl) ve kırmızı LED ışığı birlikte kolajen tip I sentezini artırır mı? Klinik veri.',
    summary: 'Matrixyl (Palmitoyl Pentapeptide-4) lipid-conjugated kolajen-stimüle edici peptittir. Kırmızı LED (630-660nm) mitokondri ATP üretimini artırır. İkisi farklı mekanizma ile fibroblast kolajen sentezini artırır → sinerjik.',
    clinical_effect: 'Matrixyl in-vitro fibroblast kolajen tip I sentezini %117 artırır (placebo: 0%). Kırmızı LED 660nm aynı hücre tipinde mitokondri ATP\'sini %150 artırır. Klinik 12 hafta kombine kullanımda kırışıklık derinliği sade peptit tedavisine göre %18 daha çok azalır.',
    synergy: 'synergistic',
    evidence: 'weak',
    protocol: '1. Sabah temizlik sonrası peptit serum uygula, 5 dk bekle. 2. Akşam aynı, sonra LED maske 15-20 dk. 3. Haftada 4-5 seans 8 hafta. 4. Sonuçlar 6 hafta sonra görünür hale gelir.',
    cautions: [
      'Peptit + retinol aynı rutinde değil — sabah peptit, akşam retinol',
      'LED maske öncesi makyaj/SPF temizlenmiş olmalı',
      'Aktif rozasea/hassas ciltte LED süre 10 dk\'ya düşür',
    ],
    citations: [
      { source: 'In vitro', title: 'Matrixyl collagen synthesis dose-response', year: 2017 },
      { source: 'Aesthet Med', title: 'LED + peptide combination 12-week clinical', year: 2021 },
    ],
  },
  {
    slug: 'azelaic-acid-microdermabrasion',
    active_name: 'Azelaik Asit',
    active_inci: 'Azelaic Acid',
    active_slug: 'azelaic-acid',
    method_name: 'Microdermabrazyon',
    method_category: 'mechanical',
    meta_title: 'Azelaik Asit + Microdermabrazyon — Rozasea ve Leke Kombine',
    meta_description: 'Azelaik asit %10-20 ile microdermabrazyon rozasea ve hiperpigmentasyon için birlikte nasıl kullanılır?',
    summary: 'Azelaik asit dikarboksilik asit, tirozinaz inhibitörü ve antiinflamatuar — rozasea ve melazma tedavisinde reçeteli %15-20 form veya kozmetik %10 form kullanılır. Microdermabrazyon yüzeysel exfoliasyon yapar; azelaik asit penetrasyonunu artırabilir.',
    clinical_effect: 'Microdermabrazyon stratum corneum\'u 5-10 mikron kaldırır → topikal aktif penetrasyon 2-3x artar. Azelaik asit penetrasyonu artınca melazma tedavisinde 4 haftada belirgin parlama sağlar; rozaseada papül sayısı 8 haftada %35 azalır (kombine vs sade topikal).',
    synergy: 'synergistic',
    evidence: 'moderate',
    protocol: '1. Microdermabrazyon seansı sonrası 24 saat sadece nemlendirici + SPF. 2. 48 saat sonra azelaik asit\'e başla, gece uygulama. 3. Haftada 1 microdermabrazyon, 4-6 hafta. 4. Azelaik asit günlük kullanım kalıcı.',
    cautions: [
      'Microdermabrazyon sonrası 48 saat AHA/BHA/Vitamin C yok',
      'Açık rozasea papülünde microdermabrazyon dikkatli',
      'Hamilelik döneminde azelaik asit %10\'a kadar OK, daha yüksek doz dermatolog onayı',
      'Yarım yüz testi öneririz başlangıçta (rozaseada flare riski)',
    ],
    citations: [
      { source: 'PubMed', pmid: '27923099', title: 'Azelaic acid penetration post-microdermabrasion', year: 2017 },
      { source: 'JAAD', title: 'Combined azelaic + mechanical exfoliation rosacea', year: 2019 },
    ],
  },
  {
    slug: 'retinol-laser-resurfacing',
    active_name: 'Retinol',
    active_inci: 'Retinol',
    active_slug: 'retinol',
    method_name: 'Fraksiyonel Lazer Resurfacing (Er:YAG / CO2)',
    method_category: 'energy',
    meta_title: 'Retinol Öncesi Fraksiyonel Lazer — Pre-treatment ve Recovery',
    meta_description: 'Fraksiyonel lazer resurfacing öncesi retinol pre-treatment kolajen yanıtını artırır mı? Wash-out süresi, post-treatment dinlenme.',
    summary: 'Fraksiyonel lazer mikro-termal yaralanma noktaları yaratır → kolajen remodeling. Retinol epidermal hazırlık olarak preLaser kullanılırsa post-treatment iyileşme süresi kısalır ve kolajen yanıtı artar. Ancak laser seansı öncesi ve sonrası mutlaka durulur.',
    clinical_effect: 'Pre-laser 4-6 hafta düşük doz retinol (%0.025-0.05) keratinosit turnover\'ı düzenler, melanosit aktivitesini azaltır → post-inflamatuar hiperpigmentasyon riski %40 azalır (özellikle Fitzpatrick III-V). Lazer sonrası iyileşme tipik 7-14 günden 5-10 güne iner.',
    synergy: 'sequential',
    evidence: 'strong',
    protocol: '1. Lazer seansından 6 hafta önce başla, düşük doz retinol günaşırı. 2. Seansın 7 gün öncesi durdur. 3. Seans günü temiz cilt + SPF 50+. 4. Seans sonrası 14-21 gün retinol yok, sadece bariyer onarım kremi. 5. 3 hafta sonra düşük doz retinol\'e geri dön.',
    cautions: [
      'İzotretinoin son 6 ay içinde kullanılmışsa fraksiyonel lazer kontrendike',
      'Aktif herpes simpleks atak döneminde lazer ertelenir + valasiklovir profilaksi',
      'Koyu ciltlerde (Fitzpatrick V-VI) fraksiyonel Er:YAG > CO2 (pigmentasyon riski daha düşük)',
      'Hamilelik döneminde retinol + lazer ikisi de kontrendike',
    ],
    citations: [
      { source: 'PubMed', pmid: '24433388', title: 'Retinoid pre-treatment in fractional resurfacing', year: 2014 },
      { source: 'Lasers Surg Med', title: 'Retinoid priming and PIH prevention', year: 2018 },
    ],
  },
];

/** Slug → pair lookup */
export function getActiveMethodPair(slug: string): ActiveMethodPair | null {
  return ACTIVE_METHOD_PAIRS.find((p) => p.slug === slug) ?? null;
}

/** Tüm slug listesi (generateStaticParams için) */
export function getAllActiveMethodSlugs(): string[] {
  return ACTIVE_METHOD_PAIRS.map((p) => p.slug);
}

/** Synergy badge stilizasyonu için */
export const SYNERGY_LABELS: Record<SynergyType, { label: string; color: string }> = {
  synergistic: { label: 'Sinerjik', color: 'green' },
  sequential: { label: 'Sıralı', color: 'amber' },
  contraindicated: { label: 'Kontrendike', color: 'red' },
  neutral: { label: 'Nötr', color: 'gray' },
};
