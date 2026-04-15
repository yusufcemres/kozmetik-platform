'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api, API_BASE_URL } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  short_description?: string;
  user_friendly_label?: string;
}

const NEEDS_FALLBACK: Need[] = [
  { need_id: 1, need_name: 'Sivilce / Akne', need_slug: 'sivilce-akne' },
  { need_id: 2, need_name: 'Leke / Hiperpigmentasyon', need_slug: 'leke-hiperpigmentasyon' },
  { need_id: 3, need_name: 'Kırışıklık / Yaşlanma', need_slug: 'kirisiklik-yaslanma' },
  { need_id: 4, need_name: 'Kuruluk / Dehidrasyon', need_slug: 'kuruluk-dehidrasyon' },
  { need_id: 5, need_name: 'Bariyer Desteği', need_slug: 'bariyer-destegi' },
  { need_id: 6, need_name: 'Gözenek Sıkılaştırma', need_slug: 'gozenek-sikalastirma' },
  { need_id: 7, need_name: 'Cilt Tonu Eşitleme', need_slug: 'cilt-tonu-esitleme' },
  { need_id: 8, need_name: 'Güneş Koruması', need_slug: 'gunes-korumasi' },
  { need_id: 9, need_name: 'Yağ Kontrolü', need_slug: 'yag-kontrolu' },
  { need_id: 10, need_name: 'Nemlendirme', need_slug: 'nemlendirme' },
  { need_id: 11, need_name: 'Hassasiyet', need_slug: 'hassasiyet' },
  { need_id: 12, need_name: 'Anti-Oksidan Koruma', need_slug: 'anti-oksidan-koruma' },
  { need_id: 17, need_name: 'Koyu Halka / Göz Altı Morluk', need_slug: 'koyu-halka-goz-alti-morluk' },
  { need_id: 18, need_name: 'Cilt Sarkması / Elastikiyet Kaybı', need_slug: 'cilt-sarkmasi-elastikiyet-kaybi' },
  { need_id: 19, need_name: 'Kızarıklık / Rozasea', need_slug: 'kizariklik-rozasea' },
  { need_id: 20, need_name: 'İnce Çizgi / Erken Kırışıklık', need_slug: 'ince-cizgi-erken-kirisiklik' },
  { need_id: 21, need_name: 'Cilt Doku Düzensizliği', need_slug: 'cilt-doku-duzensizligi' },
  { need_id: 22, need_name: 'Sivilce İzi / Akne Skarı', need_slug: 'sivilce-izi-akne-skari' },
  { need_id: 23, need_name: 'Göz Çevresi Bakımı', need_slug: 'goz-cevresi-bakimi' },
  { need_id: 24, need_name: 'Dudak Bakımı', need_slug: 'dudak-bakimi' },
  { need_id: 25, need_name: 'Boyun & Dekolte Bakımı', need_slug: 'boyun-dekolte-bakimi' },
  { need_id: 26, need_name: 'Detoks / Arındırma', need_slug: 'detoks-arindirma' },
  { need_id: 27, need_name: 'Parlaklık / Glow', need_slug: 'parlaklik-glow' },
  { need_id: 28, need_name: 'Mavi Işık / Ekran Koruması', need_slug: 'mavi-isik-ekran-korumasi' },
  { need_id: 29, need_name: 'Kirlilik / Çevre Koruması', need_slug: 'kirlilik-cevre-korumasi' },
];

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
    affiliate_links?: { affiliate_link_id: number; platform: string; affiliate_url: string; price_snapshot?: number }[];
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

// === Analysis Loading Screen ===

const ANALYSIS_STEPS = [
  { label: 'Cilt profili oluşturuluyor', icon: 'person_search', duration: 800 },
  { label: 'İhtiyaçlar analiz ediliyor', icon: 'analytics', duration: 700 },
  { label: 'Hassasiyetler kontrol ediliyor', icon: 'shield', duration: 600 },
  { label: '1900+ ürün taranıyor', icon: 'inventory_2', duration: 800 },
  { label: 'İçerik uyumluluğu hesaplanıyor', icon: 'science', duration: 700 },
  { label: 'Kişisel öneriler hazırlanıyor', icon: 'auto_awesome', duration: 400 },
];

function AnalysisLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIdx = 0;
    let elapsed = 0;
    const totalDuration = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 50;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);

      // Advance step
      let cumulative = 0;
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        cumulative += ANALYSIS_STEPS[i].duration;
        if (elapsed < cumulative) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setProgress(100);
        setCurrentStep(ANALYSIS_STEPS.length - 1);
        setTimeout(onComplete, 400);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      {/* Circular progress */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="6" fill="none" className="text-surface-container" />
          <circle
            cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="6" fill="none"
            className="text-primary transition-all duration-200"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <span className="material-icon animate-pulse" aria-hidden="true">
            {ANALYSIS_STEPS[currentStep]?.icon}
          </span>
          <span className="text-sm font-medium">{ANALYSIS_STEPS[currentStep]?.label}</span>
        </div>
      </div>

      {/* Step list */}
      <div className="w-full max-w-sm space-y-2">
        {ANALYSIS_STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-300 ${
              idx < currentStep
                ? 'opacity-100'
                : idx === currentStep
                  ? 'opacity-100 bg-primary/5'
                  : 'opacity-30'
            }`}
          >
            <span className={`material-icon text-[18px] ${
              idx < currentStep ? 'text-score-high' : idx === currentStep ? 'text-primary' : 'text-outline-variant'
            }`} aria-hidden="true">
              {idx < currentStep ? 'check_circle' : idx === currentStep ? step.icon : 'radio_button_unchecked'}
            </span>
            <span className={`text-xs ${idx <= currentStep ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Content ===

function ResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [products, setProducts] = useState<ProductScore[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [routineView, setRoutineView] = useState<'daily' | 'weekly'>('daily');

  const skinType = searchParams.get('skin_type') || '';
  const skinFeel = searchParams.get('skin_feel') || '';
  const ageRange = searchParams.get('age_range') || '';
  const concerns = searchParams.get('concerns')?.split(',').filter(Boolean).map(Number) || [];
  const sensitivityList = searchParams.get('sensitivities')?.split(',').filter(Boolean) || [];
  const budget = searchParams.get('budget') || '';
  const goals = searchParams.get('goals')?.split(',').filter(Boolean) || [];
  const gender = searchParams.get('gender') || '';
  const climate = searchParams.get('climate') || '';
  const stress = searchParams.get('stress') || '';
  const sleep = searchParams.get('sleep') || '';
  const sun = searchParams.get('sun') || '';
  const water = searchParams.get('water') || '';
  const diet = searchParams.get('diet') || '';
  const smoking = searchParams.get('smoking') || '';
  const exercise = searchParams.get('exercise') || '';

  useEffect(() => {
    async function load() {
      try {
        let allNeeds: Need[] = [];
        try {
          const needsRes = await api.get<{ data: Need[] }>('/needs?limit=50');
          allNeeds = needsRes.data || [];
        } catch {
          allNeeds = NEEDS_FALLBACK;
        }
        if (allNeeds.length === 0) allNeeds = NEEDS_FALLBACK;
        const selectedNeeds = allNeeds.filter((n) => concerns.includes(n.need_id));
        setNeeds(selectedNeeds);

        const allProducts: ProductScore[] = [];
        for (const needId of concerns) {
          try {
            const scores = await api.get<ProductScore[]>(
              `/scoring/needs/${needId}/top-products?limit=5`,
            );
            if (scores) allProducts.push(...scores.map(s => ({ ...s, needId })));
          } catch (err) {
            console.error(`[cilt-analizi] top-products fetch failed for need ${needId}:`, err);
          }
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

        // Save analysis results to profile
        try {
          const storedProfile = localStorage.getItem('skin_profile');
          if (storedProfile) {
            const prof = JSON.parse(storedProfile);
            prof.last_analysis = {
              date: new Date().toISOString(),
              recommended_products: sorted.slice(0, 5).map((s) => ({
                product_id: s.product!.product_id,
                product_name: s.product!.product_name,
                score: Number(s.compatibility_score),
                slug: s.product!.product_slug,
              })),
            };
            localStorage.setItem('skin_profile', JSON.stringify(prof));
            window.dispatchEvent(new Event('skin-profile-changed'));
          }
        } catch (err) {
          console.error('[cilt-analizi] localStorage skin_profile update failed:', err);
        }

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
        setDataReady(true);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show analysis animation, then reveal results when both animation AND data are done
  const handleAnalysisComplete = useCallback(() => {
    setAnalyzing(false);
  }, []);

  useEffect(() => {
    if (!analyzing && dataReady) setLoading(false);
  }, [analyzing, dataReady]);

  if (loading) {
    return <AnalysisLoadingScreen onComplete={handleAnalysisComplete} />;
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

  // === Supplement Tips ===
  const supplementTips: { icon: string; title: string; description: string; ingredients: string[]; warning?: string }[] = [];

  if (sun === 'low' || climate === 'cold_dry') {
    supplementTips.push({
      icon: 'wb_sunny',
      title: 'D Vitamini',
      description: 'Düşük güneş maruziyeti D vitamini eksikliği riski oluşturur. D vitamini cilt bariyeri ve bağışıklık için kritiktir.',
      ingredients: ['D3 Vitamini (Kolekalsiferol)', '1000-2000 IU/gün'],
    });
  }

  if (skinType === 'dry' || skinFeel === 'flaky' || skinFeel === 'tight') {
    supplementTips.push({
      icon: 'water_drop',
      title: 'Omega-3 Yağ Asitleri',
      description: 'Kuru ve pullu ciltlerde omega-3 cilt bariyerini içeriden destekler, inflamasyonu azaltır.',
      ingredients: ['Balık Yağı / Alg Yağı', 'EPA + DHA min 500mg/gün'],
    });
  }

  if (skinType === 'oily' || goals.includes('acne_control')) {
    supplementTips.push({
      icon: 'shield',
      title: 'Çinko',
      description: 'Çinko sebum üretimini düzenler ve akne ile bağlantılı inflamasyonu azaltır.',
      ingredients: ['Çinko Bisglisinat', '15-30mg/gün'],
    });
  }

  if (ageRange && ['35-39', '40-44', '45-54', '55+'].includes(ageRange)) {
    supplementTips.push({
      icon: 'fitness_center',
      title: 'Kolajen Peptitleri',
      description: '35 yaşından itibaren kolajen üretimi azalır. Oral kolajen cilt elastikiyetini ve nemini destekler.',
      ingredients: ['Hidrolize Kolajen Tip I & III', '5-10g/gün'],
    });
  }

  if (stress === 'high' || diet === 'processed') {
    supplementTips.push({
      icon: 'psychology',
      title: 'Probiyotik',
      description: 'Yüksek stres ve işlenmiş gıda tüketimi bağırsak-cilt aksını bozar. Probiyotikler cilt inflamasyonunu azaltabilir.',
      ingredients: ['Lactobacillus + Bifidobacterium', 'Min 10 milyar CFU/gün'],
    });
  }

  if (smoking === 'yes') {
    supplementTips.push({
      icon: 'smoking_rooms',
      title: 'C Vitamini Takviyesi',
      description: 'Sigara kullanımı C vitamini depolarını hızla tüketir. C vitamini kolajen sentezi ve antioksidan savunma için şart.',
      ingredients: ['Askorbik Asit / Ester-C', '500-1000mg/gün'],
      warning: 'Sigara cildin en büyük düşmanı — bırakmak her takviyeden etkili.',
    });
  }

  if (water === 'low') {
    supplementTips.push({
      icon: 'local_drink',
      title: 'Oral Hyaluronik Asit',
      description: 'Düşük su tüketimi cilt nemini direkt etkiler. Oral HA cildin nem tutma kapasitesini artırır.',
      ingredients: ['Hyaluronik Asit', '120-240mg/gün'],
    });
  }

  if (goals.includes('firmness') || (gender === 'male' && ageRange && ['30-34', '35-39', '40-44', '45-54', '55+'].includes(ageRange))) {
    supplementTips.push({
      icon: 'spa',
      title: 'Biotin (B7)',
      description: 'Saç, tırnak ve cilt sağlığını destekler. Özellikle sıkılaştırma hedefinde keratin üretimini artırır.',
      ingredients: ['Biotin (D-Biotin)', '2500-5000 mcg/gün'],
    });
  }

  if (exercise === 'none' && stress !== 'low') {
    supplementTips.push({
      icon: 'self_improvement',
      title: 'Magnezyum',
      description: 'Hareketsiz yaşam ve stres magnezyum depolarını tüketir. Magnezyum cilt onarımı ve uyku kalitesini destekler.',
      ingredients: ['Magnezyum Bisglisinat', '200-400mg/gün (akşam)'],
    });
  }

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

      {/* Supplement Tips */}
      {supplementTips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">medication</span>
            Destekleyici Takviye Önerileri
          </h2>
          <p className="text-xs text-on-surface-variant mb-4">Yaşam tarzına göre cildini içeriden destekleyebilecek takviyeler.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supplementTips.map((tip) => (
              <div key={tip.title} className="curator-card p-4 border-l-2 border-l-primary/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icon text-primary" aria-hidden="true">{tip.icon}</span>
                  <h3 className="font-bold text-on-surface text-sm">{tip.title}</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{tip.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tip.ingredients.map((ing) => (
                    <span key={ing} className="bg-primary/5 text-primary px-2 py-1 rounded-sm text-[10px] font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
                {tip.warning && (
                  <div className="mt-2 flex items-start gap-1.5 bg-score-medium/10 rounded-sm p-2">
                    <span className="material-icon text-score-medium text-[14px] mt-0.5 shrink-0" aria-hidden="true">warning_amber</span>
                    <p className="text-[10px] text-score-medium leading-relaxed">{tip.warning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 bg-surface-container-low rounded-sm p-3 flex items-start gap-2">
            <span className="material-icon text-outline text-[14px] mt-0.5 shrink-0" aria-hidden="true">info</span>
            <p className="text-[10px] text-outline leading-relaxed">
              Bu öneriler genel bilgi amaçlıdır, tıbbi tavsiye niteliğinde değildir.
              Herhangi bir takviye kullanmadan önce sağlık uzmanınıza danışın.
            </p>
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
          <div>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              Cilt profiline göre şu ürün tiplerini aramanı öneriyoruz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(() => {
                // Need → recommended product categories mapping
                const needCategoryMap: Record<number, { icon: string; label: string; search: string }[]> = {
                  1: [{ icon: 'science', label: 'Salisilik Asit Temizleyici', search: 'salicylic' }, { icon: 'healing', label: 'Sivilce Bakım Serumu', search: 'acne+serum' }],
                  2: [{ icon: 'light_mode', label: 'C Vitamini Serum', search: 'vitamin+c+serum' }, { icon: 'auto_awesome', label: 'Leke Karşıtı Krem', search: 'brightening' }],
                  3: [{ icon: 'fitness_center', label: 'Retinol Serum', search: 'retinol' }, { icon: 'spa', label: 'Anti-Aging Krem', search: 'anti+aging' }],
                  4: [{ icon: 'water_drop', label: 'Hyaluronik Asit Serum', search: 'hyaluronic' }, { icon: 'opacity', label: 'Yoğun Nemlendirici', search: 'moisturizer' }],
                  5: [{ icon: 'shield', label: 'Ceramide Krem', search: 'ceramide' }, { icon: 'water_drop', label: 'Bariyer Onarıcı', search: 'barrier+repair' }],
                  6: [{ icon: 'blur_on', label: 'Niacinamide Serum', search: 'niacinamide' }, { icon: 'science', label: 'BHA Tonik', search: 'bha+toner' }],
                  7: [{ icon: 'palette', label: 'Aydınlatıcı Serum', search: 'brightening+serum' }, { icon: 'light_mode', label: 'Ton Eşitleyici', search: 'tone+corrector' }],
                  8: [{ icon: 'wb_sunny', label: 'SPF 50+ Güneş Kremi', search: 'spf+50' }, { icon: 'shield', label: 'Antioksidan Serum', search: 'antioxidant' }],
                  9: [{ icon: 'opacity', label: 'Matlaştırıcı Krem', search: 'oil+control' }, { icon: 'science', label: 'Niacinamide Serum', search: 'niacinamide' }],
                  10: [{ icon: 'water_drop', label: 'HA Nemlendirici', search: 'hyaluronic+moisturizer' }, { icon: 'spa', label: 'Nemlendirici Maske', search: 'hydrating+mask' }],
                  11: [{ icon: 'healing', label: 'Centella Krem', search: 'centella' }, { icon: 'spa', label: 'Hassas Cilt Temizleyici', search: 'sensitive+cleanser' }],
                  12: [{ icon: 'shield', label: 'Antioksidan Serum', search: 'antioxidant+serum' }, { icon: 'light_mode', label: 'C Vitamini Kremi', search: 'vitamin+c' }],
                };
                // Fallback for needs 17-29
                const defaultRecs = [{ icon: 'search', label: 'Uyumlu Ürünleri Keşfet', search: '' }];
                const recs = concerns.flatMap(id => needCategoryMap[id] || defaultRecs).slice(0, 6);
                const unique = recs.filter((r, i, a) => a.findIndex(x => x.label === r.label) === i);
                return unique.map((rec) => (
                  <Link
                    key={rec.label}
                    href={`/urunler?search=${rec.search}&skin_type=${skinType}`}
                    className="curator-card p-4 flex items-center gap-3 hover:border-primary transition-colors group"
                  >
                    <span className="material-icon text-primary text-xl" aria-hidden="true">{rec.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{rec.label}</span>
                      <span className="text-[10px] text-on-surface-variant block">Ürünleri gör</span>
                    </div>
                    <span className="material-icon text-outline-variant text-sm group-hover:text-primary" aria-hidden="true">arrow_forward</span>
                  </Link>
                ));
              })()}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 8).map((ps, idx) => {
              const product = ps.product!;
              const score = Math.round(Number(ps.compatibility_score));
              const rawImg = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
              const img = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;
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
                          href={`${API_BASE_URL}/r/${cheapest.affiliate_link_id}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
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
                          href={`${API_BASE_URL}/r/${cheapest.affiliate_link_id}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
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

      {/* Two-Tier Routine: Daily + Weekly */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">schedule</span>
          Önerilen Bakım Rutinin
        </h2>

        {/* Tab bar */}
        <div className="flex bg-surface-container rounded-sm p-1 mb-6">
          {(['daily', 'weekly'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setRoutineView(view)}
              className={`flex-1 py-2.5 px-4 rounded-sm text-xs font-semibold transition-all ${
                routineView === view
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {view === 'daily' ? 'Günlük Plan' : 'Haftalık Plan'}
            </button>
          ))}
        </div>

        {/* === DAILY PLAN === */}
        {routineView === 'daily' && (
          <>
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

            {/* "Can't do this daily?" banner */}
            <div className="mt-5 bg-primary/5 border border-primary/15 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="material-icon text-primary text-xl" aria-hidden="true">tips_and_updates</span>
              <div className="flex-1">
                <p className="text-sm text-on-surface font-medium">Buna her gün uyamam diyorsan?</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Haftalık plan daha esnek — aynı sonucu daha rahat bir tempoda yakala.</p>
              </div>
              <button
                onClick={() => setRoutineView('weekly')}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap flex items-center gap-1"
              >
                Haftalık Plana Geç
                <span className="material-icon text-[14px]" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </>
        )}

        {/* === WEEKLY PLAN === */}
        {routineView === 'weekly' && (() => {
          const isSensitive = skinType === 'sensitive';
          const isOily = skinType === 'oily';
          const isDry = skinType === 'dry';
          const ageNum = ageRange ? parseInt(ageRange.split('-')[0]) || 0 : 0;
          const isMature = ageNum >= 35;

          type DayRow = { day: string; icon: string; morning: string; evening: string; tag: string; tagColor: string };
          const week: DayRow[] = [
            {
              day: 'Pazartesi', icon: 'bolt',
              morning: 'Temel rutin + SPF',
              evening: isSensitive ? 'Bakuchiol serum' : (isMature ? 'Retinol serum' : 'AHA/BHA serum'),
              tag: 'Aktif', tagColor: 'bg-primary text-on-primary',
            },
            {
              day: 'Salı', icon: 'spa',
              morning: 'Temel rutin + SPF',
              evening: 'Sadece nemlendirici',
              tag: 'Dinlenme', tagColor: 'bg-surface-container text-on-surface-variant',
            },
            {
              day: 'Çarşamba', icon: 'balance',
              morning: 'Temel rutin + SPF',
              evening: isOily ? 'Niacinamide (yağ kontrolü)' : 'Niacinamide serum',
              tag: 'Orta', tagColor: 'bg-score-medium/15 text-score-medium',
            },
            {
              day: 'Perşembe', icon: 'water_drop',
              morning: 'Temel rutin + SPF',
              evening: 'Hyaluronik asit + nemlendirici',
              tag: 'Dinlenme', tagColor: 'bg-surface-container text-on-surface-variant',
            },
            {
              day: 'Cuma', icon: 'auto_awesome',
              morning: 'Temel rutin + SPF',
              evening: isSensitive ? 'Sadece nemlendirici' : (isMature ? 'Retinol serum' : 'AHA/BHA serum'),
              tag: isSensitive ? 'Dinlenme' : 'Aktif',
              tagColor: isSensitive ? 'bg-surface-container text-on-surface-variant' : 'bg-primary text-on-primary',
            },
            {
              day: 'Cumartesi', icon: 'self_improvement',
              morning: 'Temel rutin + SPF',
              evening: isSensitive ? 'Enzim maske + nemlendirici' : (isOily ? 'BHA peeling + kil maskesi' : 'AHA peeling + nem maskesi'),
              tag: 'Derin Bakım', tagColor: 'bg-score-high/15 text-score-high',
            },
            {
              day: 'Pazar', icon: 'hotel',
              morning: 'Temel rutin + SPF',
              evening: isDry ? 'Bakım yağı + sleeping mask' : 'Peptit serum + yoğun nemlendirici',
              tag: 'Onarım', tagColor: 'bg-score-high/15 text-score-high',
            },
          ];

          return (
            <>
              <p className="text-xs text-on-surface-variant mb-4">
                Sabah her gün aynı: Temizleme → Tonik → Serum → Nemlendirici → SPF. Fark akşamda.
              </p>

              <div className="space-y-2">
                {week.map((d) => (
                  <div key={d.day} className="curator-card p-4 flex items-center gap-3">
                    <span className="material-icon text-primary text-lg" aria-hidden="true">{d.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-on-surface">{d.day}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.tagColor}`}>{d.tag}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-icon text-[12px]" aria-hidden="true">dark_mode</span>
                        {d.evening}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-primary/5 border border-primary/10 rounded-sm p-3">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-semibold text-on-surface">Temel kurallar:</span> Aktif geceden sonraki gün SPF şart.
                  Cilt tahriş olursa aktif geceyi atla, yerine nemlendirici kullan.
                  {isSensitive && ' Hassas cildin için haftada tek aktif gece yeterli.'}
                  {isMature && ' 35+ yaş için retinol geceleri kolajen üretimini destekler.'}
                </p>
              </div>
            </>
          );
        })()}
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
