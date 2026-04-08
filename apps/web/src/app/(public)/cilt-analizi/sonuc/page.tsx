'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  short_description?: string;
  user_friendly_label?: string;
}

interface ProductScore {
  compatibility_score: number;
  confidence_level: string;
  needId?: number;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    product_type_label?: string;
    short_description?: string;
    brand?: { brand_name: string };
    category?: { category_name: string };
    images?: { image_url: string; sort_order?: number }[];
    affiliate_links?: { platform: string; affiliate_url: string; price_snapshot?: number }[];
  };
}

// === Helpers ===

const skinTypeLabels: Record<string, string> = {
  oily: 'Yağlı', dry: 'Kuru', combination: 'Karma', normal: 'Normal', sensitive: 'Hassas',
};

const skinTypeDescriptions: Record<string, string> = {
  oily: 'Yağlı ciltler sebum üretiminin fazla olduğu cilt tipleridir. Hafif, su bazlı ve matlaştırıcı formüller en uygundur. Niacinamide ve salisilik asit gibi aktifler gözenekleri sıkılaştırır.',
  dry: 'Kuru ciltlerin nem bariyeri zayıftır. Ceramide, hyaluronik asit ve şea yağı gibi besleyici bileşenler bariyeri onarır ve nemi kilitler.',
  combination: 'Karma ciltlerde T-bölge yağlı, yanaklar kuru/normal olabilir. Dengeleyici formüller ve bölgeye özel bakım en iyi sonucu verir.',
  normal: 'Normal ciltler dengeli nem üretimine sahiptir. Koruyucu antioksidanlar ve hafif nemlendiriciler yeterlidir.',
  sensitive: 'Hassas ciltlerde bariyer fonksiyonu zayıflamıştır. Parfümsüz, minimal bileşenli ve yatıştırıcı formüller tercih edilmelidir.',
};

const skinFeelLabels: Record<string, string> = {
  tight: 'Gergin & Sıkı', oily_midday: 'Öğlene Kadar Yağlanır', flaky: 'Pullanma & Soyulma',
  comfortable: 'Rahat & Dengeli', reactive: 'Reaktif & Kızarık',
};

const budgetLabels: Record<string, string> = {
  budget: 'Uygun Fiyatlı', mid: 'Orta Segment', premium: 'Premium',
};

const goalLabels: Record<string, string> = {
  anti_aging: 'Yaşlanma Karşıtı', brightening: 'Aydınlatma', hydration: 'Nemlendirme',
  acne_control: 'Akne Kontrolü', pore_minimize: 'Gözenek Sıkılaştırma',
  barrier_repair: 'Bariyer Onarımı', even_tone: 'Ton Eşitleme', firmness: 'Sıkılaştırma',
};

const climateLabels: Record<string, string> = {
  hot_humid: 'Sıcak & Nemli', hot_dry: 'Sıcak & Kuru', temperate: 'Ilıman',
  cold_dry: 'Soğuk & Kuru', variable: 'Değişken',
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
}

/** Generate a human-readable explanation for why we recommend this product */
function getRecommendationReason(
  ps: ProductScore,
  needs: Need[],
  skinType: string,
  goals: string[],
): string {
  const parts: string[] = [];
  const score = Math.round(Number(ps.compatibility_score));
  const need = needs.find((n) => n.need_id === ps.needId);
  const category = ps.product?.category?.category_name;
  const type = ps.product?.product_type_label;

  // Score-based reason
  if (score >= 80) {
    parts.push(`%${score} uyumluluk skoru ile cilt profiline en uygun ürünlerden biri`);
  } else if (score >= 60) {
    parts.push(`%${score} uyumluluk skoru ile ihtiyaçlarına iyi yanıt veriyor`);
  } else {
    parts.push(`%${score} uyumluluk skoru`);
  }

  // Need-based reason
  if (need) {
    parts.push(`"${need.need_name}" ihtiyacın için özellikle etkili bileşenler içeriyor`);
  }

  // Skin type alignment
  if (skinType === 'oily' && (type === 'serum' || type === 'jel')) {
    parts.push('Yağlı ciltler için ideal olan hafif formüle sahip');
  } else if (skinType === 'dry' && (type === 'krem' || type === 'nemlendirici')) {
    parts.push('Kuru ciltlerin ihtiyaç duyduğu yoğun besleyici formülde');
  } else if (skinType === 'sensitive') {
    parts.push('Hassas ciltlere uygun nazik formül');
  }

  return parts.join('. ') + '.';
}

/** Generate usage purpose description */
function getUsagePurpose(ps: ProductScore, need: Need | undefined): string {
  const category = ps.product?.category?.category_name || '';
  const type = ps.product?.product_type_label || '';

  // Category-based usage
  const usageMap: Record<string, string> = {
    'Serum & Ampul': 'Temizlik sonrası, nemlendirici öncesi uygula. Aktif bileşenlerin derinin derinlerine ulaşmasını sağlar.',
    'Nemlendirici Krem': 'Bakım rutininin son adımı olarak uygula. Nem bariyerini güçlendirir ve cildi korur.',
    'Yüz Temizleme Jeli': 'Sabah ve akşam ilk adım olarak kullan. Gözeneklerdeki kirliliği ve fazla sebumu temizler.',
    'Tonik & Losyon': 'Temizleyici sonrası, serum öncesi uygula. Cildin pH dengesini düzenler ve sonraki adımların emilimini artırır.',
    'Yüz Güneş Kremi': 'Her sabah son adım olarak uygula. UV hasarını engelleyerek yaşlanmayı, lekeleri ve cilt kanserini önler.',
    'Göz Kremi': 'Göz çevresine parmak ucuyla hafifçe vurarak uygula. İnce göz çevresi cildini besler ve korur.',
    'Peeling & Eksfolyan': 'Haftada 2-3 kez akşam rutininde temizleyici sonrası uygula. Ölü hücreleri uzaklaştırır, cilt yenilenmesini hızlandırır.',
    'Makyaj Temizleyici': 'Akşam rutininin ilk adımı. Makyaj ve güneş kremini nazikçe çözer.',
    'Gece Bakım': 'Yatmadan önce son adım olarak uygula. Gece boyunca cildin onarım sürecini destekler.',
  };

  let usage = usageMap[category] || '';

  // Type-based fallback
  if (!usage) {
    if (type.includes('serum')) usage = 'Temizlik sonrası, nemlendirici öncesi birkaç damla uygula.';
    else if (type.includes('krem')) usage = 'Temizlik ve serum sonrası cilde masaj yaparak uygula.';
    else if (type.includes('temizleyici')) usage = 'Sabah ve akşam ıslak cilde uygula, köpürterek temizle.';
    else usage = 'Ürün kullanım talimatına göre günlük bakım rutininde uygula.';
  }

  // Need-based additional context
  if (need) {
    usage += ` Bu ürün özellikle ${need.need_name.toLowerCase()} ihtiyacına yönelik etkili bileşenler barındırıyor.`;
  }

  return usage;
}

// === Morning/Evening routine category order ===
const MORNING_ORDER = ['Temizleme', 'Yüz Temizleme Jeli', 'Tonik & Losyon', 'Serum & Ampul', 'Göz Kremi', 'Nemlendirici Krem', 'Yüz Güneş Kremi'];
const EVENING_ORDER = ['Makyaj Temizleyici', 'Temizleme Yağı & Balm', 'Yüz Temizleme Jeli', 'Tonik & Losyon', 'Peeling & Eksfolyan', 'Serum & Ampul', 'Göz Kremi', 'Nemlendirici Krem', 'Gece Bakım'];

// === Content ===

function ResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductScore[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  const skinType = searchParams.get('skin_type') || '';
  const skinFeel = searchParams.get('skin_feel') || '';
  const ageRange = searchParams.get('age_range') || '';
  const concerns = searchParams.get('concerns')?.split(',').filter(Boolean).map(Number) || [];
  const sensitivityList = searchParams.get('sensitivities')?.split(',').filter(Boolean) || [];
  const budget = searchParams.get('budget') || '';
  const goals = searchParams.get('goals')?.split(',').filter(Boolean) || [];
  const climate = searchParams.get('climate') || '';
  const stress = searchParams.get('stress') || '';
  const sleep = searchParams.get('sleep') || '';
  const sun = searchParams.get('sun') || '';

  useEffect(() => {
    async function load() {
      try {
        const needsRes = await api.get<{ data: Need[] }>('/needs?limit=50');
        const allNeeds = needsRes.data || [];
        const selectedNeeds = allNeeds.filter((n) => concerns.includes(n.need_id));
        setNeeds(selectedNeeds);

        const allProducts: ProductScore[] = [];
        for (const needId of concerns) {
          try {
            const scores = await api.get<ProductScore[]>(
              `/scoring/needs/${needId}/top-products?limit=5`,
            );
            if (scores) allProducts.push(...scores.map(s => ({ ...s, needId })));
          } catch {}
        }

        const productMap = new Map<number, ProductScore>();
        for (const ps of allProducts) {
          if (!ps.product) continue;
          const existing = productMap.get(ps.product.product_id);
          if (!existing || Number(ps.compatibility_score) > Number(existing.compatibility_score)) {
            productMap.set(ps.product.product_id, ps);
          }
        }

        const sorted = [...productMap.values()]
          .sort((a, b) => Number(b.compatibility_score) - Number(a.compatibility_score))
          .slice(0, 10);
        setProducts(sorted);

        const avoid: string[] = [];
        if (sensitivityList.includes('fragrance')) avoid.push('Parfum (Fragrance)', 'Linalool', 'Limonene', 'Citronellol');
        if (sensitivityList.includes('alcohol')) avoid.push('Alcohol Denat', 'Ethanol', 'Isopropyl Alcohol');
        if (sensitivityList.includes('paraben')) avoid.push('Methylparaben', 'Propylparaben', 'Butylparaben', 'Ethylparaben');
        if (sensitivityList.includes('essential_oils')) avoid.push('Tea Tree Oil', 'Lavender Oil', 'Eucalyptus Oil', 'Peppermint Oil');
        if (sensitivityList.includes('retinol')) avoid.push('Retinol', 'Retinyl Palmitate', 'Retinaldehyde');
        if (sensitivityList.includes('aha_bha')) avoid.push('Glycolic Acid', 'Salicylic Acid', 'Lactic Acid', 'Mandelic Acid');
        setAvoidIngredients(avoid);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex flex-col items-center gap-4 text-primary">
          <span className="material-icon animate-spin" style={{ fontSize: '36px' }} aria-hidden="true">progress_activity</span>
          <div>
            <p className="text-sm font-medium">Analiz sonuçlarınız hazırlanıyor...</p>
            <p className="text-xs text-on-surface-variant mt-1">Cilt profilinize uygun ürünler eşleştiriliyor</p>
          </div>
        </div>
      </div>
    );
  }

  const shareText = `REVELA Cilt Analizi sonucum: ${skinTypeLabels[skinType]} cilt, ${needs.map(n => n.need_name).join(', ')} ihtiyaçları. Kişisel ürün önerilerimi gör!`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate lifestyle insights
  const insights: string[] = [];
  if (sun === 'high') insights.push('Yüksek güneş maruziyetin var — SPF 50+ güneş kremi şart, antioksidan serumlar da faydalı.');
  if (stress === 'high') insights.push('Yüksek stres ciltte inflamasyon ve sivilceye yol açabilir — niacinamide ve adaptojenik bileşenler yardımcı olur.');
  if (sleep === 'poor') insights.push('Yetersiz uyku cildin gece onarımını engelliyor — retinol ve peptit içerikli gece bakımı önerilir.');
  if (climate === 'hot_humid') insights.push('Sıcak nemli iklimde hafif, su bazlı ürünler tercih et, ağır kremlerden kaçın.');
  if (climate === 'cold_dry') insights.push('Soğuk kuru havada nem bariyerini güçlendir — ceramide ve hyaluronik asit önemli.');
  if (skinFeel === 'reactive') insights.push('Reaktif cildinde bariyer onarımı öncelikli — centella asiatica ve panthenol yatıştırıcı etkiler sunar.');

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="material-icon text-score-high mb-2 block" style={{ fontSize: '48px' }} aria-hidden="true">
          check_circle
        </span>
        <h1 className="text-3xl headline-tight text-on-surface">KİŞİSEL CİLT ANALİZİN</h1>
        <p className="text-on-surface-variant text-sm mt-2">Bilimsel analiz ve kişisel cilt profiline göre hazırlandı</p>
      </div>

      {/* Detailed Profile Card */}
      <div className="curator-card p-6 mb-8">
        <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">person</span>
          Cilt Profilin
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Cilt Tipi</p>
            <p className="font-bold text-on-surface">{skinTypeLabels[skinType] || skinType}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Cilt Hissi</p>
            <p className="font-bold text-on-surface text-xs">{skinFeelLabels[skinFeel] || '-'}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Yaş</p>
            <p className="font-bold text-on-surface">{ageRange || '-'}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Bütçe</p>
            <p className="font-bold text-on-surface">{budgetLabels[budget] || budget}</p>
          </div>
        </div>

        {/* Skin type explanation */}
        {skinTypeDescriptions[skinType] && (
          <div className="bg-primary/5 border border-primary/10 rounded-sm p-4 mb-4">
            <p className="text-sm text-on-surface leading-relaxed">
              <span className="font-semibold">{skinTypeLabels[skinType]} Cilt: </span>
              {skinTypeDescriptions[skinType]}
            </p>
          </div>
        )}

        {/* Needs & Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="label-caps text-outline mb-2">İhtiyaçların</p>
            <div className="flex flex-wrap gap-2">
              {needs.map((n) => (
                <Link
                  key={n.need_id}
                  href={`/ihtiyaclar/${n.need_slug}`}
                  className="bg-primary/5 text-primary px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-primary/10 transition-colors"
                >
                  {n.need_name}
                </Link>
              ))}
            </div>
          </div>
          {goals.length > 0 && (
            <div>
              <p className="label-caps text-outline mb-2">Hedeflerin</p>
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <span key={g} className="bg-score-high/10 text-score-high px-3 py-1.5 rounded-sm text-xs font-medium">
                    {goalLabels[g] || g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Extra info */}
        <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-on-surface-variant">
          {sensitivityList.length > 0 && (
            <span className="flex items-center gap-1 bg-error/5 text-error px-2 py-1 rounded-sm">
              <span className="material-icon text-[14px]" aria-hidden="true">warning_amber</span>
              {sensitivityList.length} hassasiyet
            </span>
          )}
          {climate && (
            <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-sm">
              <span className="material-icon text-[14px]" aria-hidden="true">thermostat</span>
              {climateLabels[climate] || climate}
            </span>
          )}
        </div>
      </div>

      {/* Lifestyle Insights */}
      {insights.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-score-medium" aria-hidden="true">tips_and_updates</span>
            Kişisel Öngörüler
          </h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="curator-card p-4 flex items-start gap-3">
                <span className="material-icon material-icon-sm text-score-medium mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Product Recommendations — Enriched */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">recommend</span>
          Sana Özel Ürün Önerileri
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">
            Henüz yeterli veri yok, yakında öneriler burada olacak.
          </p>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 8).map((ps, idx) => {
              const product = ps.product!;
              const score = Math.round(Number(ps.compatibility_score));
              const img = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
              const cheapest = product.affiliate_links?.reduce((min, l) =>
                l.price_snapshot && (!min.price_snapshot || l.price_snapshot < min.price_snapshot) ? l : min,
                product.affiliate_links?.[0],
              );
              const need = needs.find(n => n.need_id === ps.needId);
              const isExpanded = expandedProduct === product.product_id;
              const reason = getRecommendationReason(ps, needs, skinType, goals);
              const usage = getUsagePurpose(ps, need);

              return (
                <div key={product.product_id} className="curator-card overflow-hidden">
                  {/* Main row */}
                  <div className="p-4 flex items-center gap-4">
                    <span className="text-lg font-bold text-outline w-6 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <Link href={`/urunler/${product.product_slug}`} className="w-16 h-16 bg-surface-container-low rounded-sm overflow-hidden shrink-0 relative">
                      {img ? (
                        <Image src={img} alt={product.product_name} fill sizes="64px" className="object-contain" />
                      ) : (
                        <span className="material-icon text-outline-variant flex items-center justify-center h-full" aria-hidden="true">inventory_2</span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      {product.brand && (
                        <p className="label-caps text-outline">{product.brand.brand_name}</p>
                      )}
                      <Link href={`/urunler/${product.product_slug}`} className="text-sm font-semibold text-on-surface truncate block hover:text-primary transition-colors">
                        {product.product_name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {need && (
                          <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-sm text-[10px] font-medium">
                            {need.need_name}
                          </span>
                        )}
                        {product.category && (
                          <span className="bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-sm text-[10px]">
                            {product.category.category_name}
                          </span>
                        )}
                        <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden max-w-[80px]">
                          <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>%{score}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cheapest && (
                        <a
                          href={`${cheapest.affiliate_url}${cheapest.affiliate_url.includes('?') ? '&' : '?'}utm_source=revela&utm_medium=affiliate&utm_campaign=cilt-analizi`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary text-on-primary px-4 py-2 rounded-sm text-xs font-medium hover:bg-primary/90 transition-colors hidden sm:block"
                        >
                          {cheapest.price_snapshot ? `₺${Number(cheapest.price_snapshot).toFixed(0)}` : 'Satın Al'}
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedProduct(isExpanded ? null : product.product_id)}
                        className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
                        aria-label={isExpanded ? 'Detayı kapat' : 'Neden bu ürün?'}
                      >
                        <span className={`material-icon material-icon-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail — Why + How to Use */}
                  {isExpanded && (
                    <div className="border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-4 animate-slide-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Why we recommend */}
                        <div>
                          <p className="label-caps text-primary mb-2 flex items-center gap-1">
                            <span className="material-icon text-[14px]" aria-hidden="true">info</span>
                            Neden Bu Ürün?
                          </p>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {reason}
                          </p>
                        </div>
                        {/* How to use */}
                        <div>
                          <p className="label-caps text-score-medium mb-2 flex items-center gap-1">
                            <span className="material-icon text-[14px]" aria-hidden="true">local_pharmacy</span>
                            Nasıl Kullanılır?
                          </p>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {usage}
                          </p>
                        </div>
                      </div>
                      {/* Mobile buy button */}
                      {cheapest && (
                        <a
                          href={`${cheapest.affiliate_url}${cheapest.affiliate_url.includes('?') ? '&' : '?'}utm_source=revela&utm_medium=affiliate&utm_campaign=cilt-analizi`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm:hidden mt-3 w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-sm text-xs font-medium"
                        >
                          {cheapest.price_snapshot ? `₺${Number(cheapest.price_snapshot).toFixed(0)} — ` : ''}Satın Al
                          <span className="material-icon text-[14px]" aria-hidden="true">open_in_new</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Morning & Evening Routine */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">schedule</span>
          Önerilen Bakım Rutini
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="curator-card p-5 border-l-2 border-l-score-medium">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">light_mode</span>
              Sabah Rutini
            </h3>
            <ol className="space-y-2.5 text-sm">
              {MORNING_ORDER.map((cat, idx) => {
                const matched = products.find(ps => {
                  const catName = ps.product?.category?.category_name || '';
                  return catName === cat || (cat.split(' ')[0].length > 3 && catName.includes(cat.split(' ')[0]));
                });
                return (
                  <li key={cat} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="text-xs font-bold text-score-medium w-5">{idx + 1}</span>
                    <span className="flex-1">{cat}</span>
                    {matched?.product && (
                      <Link href={`/urunler/${matched.product.product_slug}`} className="text-[10px] text-primary truncate max-w-[160px] hover:underline">
                        {matched.product.brand?.brand_name} {matched.product.product_name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          {/* Evening */}
          <div className="curator-card p-5 border-l-2 border-l-primary">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">dark_mode</span>
              Akşam Rutini
            </h3>
            <ol className="space-y-2.5 text-sm">
              {EVENING_ORDER.map((cat, idx) => {
                const matched = products.find(ps => {
                  const catName = ps.product?.category?.category_name || '';
                  return catName === cat || (cat.split(' ')[0].length > 3 && catName.includes(cat.split(' ')[0]));
                });
                return (
                  <li key={cat} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="text-xs font-bold text-primary w-5">{idx + 1}</span>
                    <span className="flex-1">{cat}</span>
                    {matched?.product && (
                      <Link href={`/urunler/${matched.product.product_slug}`} className="text-[10px] text-primary truncate max-w-[160px] hover:underline">
                        {matched.product.brand?.brand_name} {matched.product.product_name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Ingredients to Avoid */}
      {avoidIngredients.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-error" aria-hidden="true">block</span>
            Kaçınılması Gereken İçerikler
          </h2>
          <div className="bg-error/5 border border-error/20 rounded-sm p-5">
            <div className="flex flex-wrap gap-2">
              {avoidIngredients.map((ing) => (
                <span key={ing} className="bg-surface text-error px-3 py-1.5 rounded-sm text-xs font-medium border border-error/20">
                  {ing}
                </span>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              Hassasiyetlerine göre bu içerikleri barındıran ürünlerden kaçınmanı öneriyoruz.
              Ürün detay sayfasında tam INCI listesini kontrol edebilirsin.
            </p>
          </div>
        </section>
      )}

      {/* Primary CTA */}
      <div className="mt-10 mb-6">
        <Link
          href={`/urunler?concerns=${concerns.join(',')}&skin_type=${skinType}&sort=compatibility`}
          className="curator-btn-primary w-full py-4 text-sm text-center flex items-center justify-center gap-2"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">grid_view</span>
          Tüm Uyumlu Ürünleri Gör
          <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>

      {/* Share + Actions */}
      <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-variant/20 pt-6">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-sm text-xs font-medium uppercase tracking-wider hover:bg-[#20BD5C] transition-colors"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">share</span>
          WhatsApp ile Paylaş
        </a>
        <Link
          href="/cilt-analizi"
          className="flex-1 curator-btn-outline py-3 text-xs text-center"
        >
          Testi Tekrarla
        </Link>
      </div>
    </div>
  );
}

export default function SkinAnalysisResultPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24">
        <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
