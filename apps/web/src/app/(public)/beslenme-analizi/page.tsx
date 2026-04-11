'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';
import { api } from '@/lib/api';

// Nutrient → ingredient_slug mapping for product recommendations
const NUTRIENT_SLUG_MAP: Record<string, string[]> = {
  'D Vitamini': ['vitamin-d', 'cholecalciferol'],
  'B12 Vitamini': ['vitamin-b12', 'methylcobalamin', 'cyanocobalamin'],
  'Omega-3': ['omega-3', 'fish-oil', 'epa', 'dha'],
  'Demir': ['iron', 'ferrous'],
  'Magnezyum': ['magnesium'],
  'Probiyotik': ['probiyotik', 'lactobacillus'],
  'C Vitamini': ['vitamin-c', 'ascorbic-acid'],
  'Çinko': ['zinc'],
  'Kalsiyum': ['calcium'],
};

interface RecommendedProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_name: string };
  images?: { image_url: string }[];
}

// === Quiz Steps ===

const STEPS: QuizStep[] = [
  {
    id: 'diet',
    question: 'Beslenme tipin nasıl?',
    type: 'single',
    options: [
      { value: 'mixed', label: 'Karışık', description: 'Her şeyi yerim', icon: 'restaurant' },
      { value: 'vegetarian', label: 'Vejeteryan', description: 'Et yemem, yumurta/süt OK', icon: 'eco' },
      { value: 'vegan', label: 'Vegan', description: 'Hiçbir hayvansal ürün', icon: 'spa' },
      { value: 'pescatarian', label: 'Pesketaryen', description: 'Balık + sebze', icon: 'set_meal' },
      { value: 'gluten_free', label: 'Glutensiz', description: 'Gluten içeren gıdaları yemem', icon: 'no_food' },
      { value: 'lactose_free', label: 'Laktoz intoleransı', description: 'Süt ürünlerini tüketemem', icon: 'no_drinks' },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Yaşam tarzın nasıl?',
    type: 'single',
    options: [
      { value: 'sedentary', label: 'Sedanter', description: 'Masa başı iş, az hareket', icon: 'weekend' },
      { value: 'moderate', label: 'Orta aktif', description: 'Haftada 2-3 gün spor', icon: 'directions_walk' },
      { value: 'active', label: 'Çok aktif', description: 'Günlük spor veya fiziksel iş', icon: 'directions_run' },
      { value: 'athlete', label: 'Sporcu', description: 'Profesyonel veya yoğun antrenman', icon: 'fitness_center' },
    ],
  },
  {
    id: 'symptoms',
    question: 'Hangi belirtileri yaşıyorsun?',
    description: 'Seni en çok rahatsız edenleri seç.',
    type: 'multi',
    maxSelections: 5,
    options: [
      { value: 'fatigue', label: 'Yorgunluk & enerji düşüklüğü', icon: 'battery_low' },
      { value: 'immunity', label: 'Sık hastalanma', icon: 'coronavirus' },
      { value: 'joint_pain', label: 'Eklem / kas ağrısı', icon: 'accessibility_new' },
      { value: 'sleep_issues', label: 'Uyku problemi', icon: 'bedtime_off' },
      { value: 'hair_loss', label: 'Saç dökülmesi', icon: 'face_retouching_off' },
      { value: 'digestion', label: 'Sindirim sorunları', icon: 'gastroenterology' },
      { value: 'stress', label: 'Stres / kaygı', icon: 'psychology' },
      { value: 'focus', label: 'Konsantrasyon güçlüğü', icon: 'lightbulb' },
      { value: 'skin_issues', label: 'Cilt sorunları', icon: 'dermatology' },
      { value: 'bone_issues', label: 'Kemik / diş sorunları', icon: 'healing' },
    ],
  },
  {
    id: 'gender_age',
    question: 'Cinsiyet ve yaş aralığın?',
    type: 'single',
    options: [
      { value: 'female_18-25', label: 'Kadın — 18-25' },
      { value: 'female_26-35', label: 'Kadın — 26-35' },
      { value: 'female_36-45', label: 'Kadın — 36-45' },
      { value: 'female_46-55', label: 'Kadın — 46-55' },
      { value: 'female_55+', label: 'Kadın — 55+' },
      { value: 'male_18-25', label: 'Erkek — 18-25' },
      { value: 'male_26-35', label: 'Erkek — 26-35' },
      { value: 'male_36-45', label: 'Erkek — 36-45' },
      { value: 'male_46-55', label: 'Erkek — 46-55' },
      { value: 'male_55+', label: 'Erkek — 55+' },
    ],
  },
  {
    id: 'current_supplements',
    question: 'Şu an takviye kullanıyor musun?',
    type: 'single',
    options: [
      { value: 'none', label: 'Hiç kullanmıyorum', icon: 'close' },
      { value: 'multivitamin', label: 'Multivitamin alıyorum', icon: 'medication' },
      { value: 'specific', label: 'Belirli takviyeler kullanıyorum', icon: 'science' },
      { value: 'irregular', label: 'Düzenli değil, ara sıra', icon: 'schedule' },
    ],
  },
  {
    id: 'budget',
    question: 'Aylık takviye bütçen ne kadar?',
    type: 'single',
    options: [
      { value: 'economic', label: 'Ekonomik (₺0-200/ay)', icon: 'savings' },
      { value: 'moderate', label: 'Orta (₺200-500/ay)', icon: 'account_balance_wallet' },
      { value: 'premium', label: 'Premium (₺500+/ay)', icon: 'diamond' },
    ],
  },
];

// === Nutrient Risk Analysis ===

interface NutrientRisk {
  nutrient: string;
  risk: 'high' | 'medium' | 'low';
  reasons: string[];
}

function analyzeNutrition(answers: QuizAnswers): {
  risks: NutrientRisk[];
  message: string;
  tips: { label: string; detail: string }[];
} {
  const diet = answers.diet as string;
  const lifestyle = answers.lifestyle as string;
  const symptoms = (answers.symptoms as string[]) || [];
  const genderAge = answers.gender_age as string;
  const gender = genderAge?.split('_')[0] || 'female';
  const age = genderAge?.split('_')[1] || '26-35';

  const risks: NutrientRisk[] = [];
  const tips: { label: string; detail: string }[] = [];

  // D Vitamini
  const dReasons: string[] = [];
  if (diet === 'vegan') dReasons.push('Vegan diyette D vitamini kaynağı sınırlı');
  if (lifestyle === 'sedentary') dReasons.push('Güneş ışığı yetersizliği (masa başı çalışma)');
  if (age === '46-55' || age === '55+') dReasons.push('Yaşla birlikte D vitamini sentezi azalır');
  if (dReasons.length >= 2) risks.push({ nutrient: 'D Vitamini', risk: 'high', reasons: dReasons });
  else if (dReasons.length === 1) risks.push({ nutrient: 'D Vitamini', risk: 'medium', reasons: dReasons });

  // B12
  const b12Reasons: string[] = [];
  if (diet === 'vegan') b12Reasons.push('Vegan diyette B12 kaynağı yok');
  if (diet === 'vegetarian') b12Reasons.push('Vejeteryan diyette B12 sınırlı');
  if (symptoms.includes('fatigue')) b12Reasons.push('Yorgunluk belirtisi');
  if (symptoms.includes('focus')) b12Reasons.push('Konsantrasyon güçlüğü');
  if (b12Reasons.length >= 2) risks.push({ nutrient: 'B12 Vitamini', risk: 'high', reasons: b12Reasons });
  else if (b12Reasons.length === 1) risks.push({ nutrient: 'B12 Vitamini', risk: 'medium', reasons: b12Reasons });

  // Omega-3
  const omegaReasons: string[] = [];
  if (diet === 'vegan' || diet === 'vegetarian') omegaReasons.push('Balık tüketimi yok');
  if (symptoms.includes('joint_pain')) omegaReasons.push('Eklem ağrısı');
  if (symptoms.includes('focus')) omegaReasons.push('Konsantrasyon güçlüğü');
  if (symptoms.includes('skin_issues')) omegaReasons.push('Cilt sorunları');
  if (omegaReasons.length >= 2) risks.push({ nutrient: 'Omega-3', risk: 'high', reasons: omegaReasons });
  else if (omegaReasons.length === 1) risks.push({ nutrient: 'Omega-3', risk: 'medium', reasons: omegaReasons });

  // Demir
  const ironReasons: string[] = [];
  if (gender === 'female' && (age === '18-25' || age === '26-35' || age === '36-45'))
    ironReasons.push('Kadın — üreme çağında demir kaybı');
  if (diet === 'vegan') ironReasons.push('Bitkisel demir emilimi düşük');
  if (symptoms.includes('fatigue')) ironReasons.push('Yorgunluk belirtisi');
  if (symptoms.includes('hair_loss')) ironReasons.push('Saç dökülmesi');
  if (ironReasons.length >= 2) risks.push({ nutrient: 'Demir', risk: 'high', reasons: ironReasons });
  else if (ironReasons.length === 1) risks.push({ nutrient: 'Demir', risk: 'medium', reasons: ironReasons });

  // Magnezyum
  const mgReasons: string[] = [];
  if (symptoms.includes('sleep_issues')) mgReasons.push('Uyku problemi');
  if (symptoms.includes('stress')) mgReasons.push('Stres / kaygı');
  if (symptoms.includes('joint_pain')) mgReasons.push('Kas ağrısı');
  if (lifestyle === 'athlete' || lifestyle === 'active') mgReasons.push('Yoğun fiziksel aktivite');
  if (mgReasons.length >= 2) risks.push({ nutrient: 'Magnezyum', risk: 'high', reasons: mgReasons });
  else if (mgReasons.length === 1) risks.push({ nutrient: 'Magnezyum', risk: 'medium', reasons: mgReasons });

  // Probiyotik
  if (symptoms.includes('digestion')) {
    risks.push({ nutrient: 'Probiyotik', risk: 'high', reasons: ['Sindirim sorunları'] });
  }
  if (symptoms.includes('immunity')) {
    risks.push({ nutrient: 'Probiyotik', risk: 'medium', reasons: ['Bağışıklık desteği'] });
  }

  // C Vitamini
  const cReasons: string[] = [];
  if (symptoms.includes('immunity')) cReasons.push('Sık hastalanma');
  if (symptoms.includes('skin_issues')) cReasons.push('Cilt sorunları');
  if (cReasons.length > 0) risks.push({ nutrient: 'C Vitamini', risk: cReasons.length >= 2 ? 'high' : 'low', reasons: cReasons });

  // Çinko
  const zincReasons: string[] = [];
  if (symptoms.includes('hair_loss')) zincReasons.push('Saç dökülmesi');
  if (symptoms.includes('immunity')) zincReasons.push('Sık hastalanma');
  if (symptoms.includes('skin_issues')) zincReasons.push('Cilt sorunları');
  if (zincReasons.length >= 2) risks.push({ nutrient: 'Çinko', risk: 'medium', reasons: zincReasons });

  // Kalsiyum
  if (diet === 'vegan' || diet === 'lactose_free') {
    const calcReasons = [diet === 'vegan' ? 'Vegan beslenme' : 'Laktoz intoleransı'];
    if (symptoms.includes('bone_issues')) calcReasons.push('Kemik sorunları');
    risks.push({ nutrient: 'Kalsiyum', risk: calcReasons.length >= 2 ? 'high' : 'medium', reasons: calcReasons });
  }

  // Sort by risk priority
  const order = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => order[a.risk] - order[b.risk]);

  // General tips
  if (diet === 'vegan') tips.push({ label: 'Vegan beslenme desteği', detail: 'B12, D3, Omega-3 (alg bazlı) ve demir takviyesi düzenli alınmalıdır.' });
  if (lifestyle === 'athlete') tips.push({ label: 'Sporcu takviyesi', detail: 'Yoğun antrenman magnezyum, çinko ve elektrolit ihtiyacını artırır.' });
  if (age === '55+') tips.push({ label: 'Yaş ilerledikçe', detail: 'D vitamini, B12 ve kalsiyum emilimi yaşla azalır. Düzenli kontrol önemlidir.' });
  tips.push({ label: 'Genel öneri', detail: 'Takviye kullanmadan önce doktorunuza danışın. Kan testi en kesin sonucu verir.' });

  const highCount = risks.filter((r) => r.risk === 'high').length;
  let message: string;
  if (highCount === 0) message = 'Genel olarak iyi durumdasın. Birkaç küçük iyileştirme yeterli.';
  else if (highCount <= 2) message = 'Birkaç önemli eksiklik riski tespit ettik. Detaylara göz at.';
  else message = 'Beslenme profiline göre birden fazla yüksek riskli eksiklik var. Kan testi öneriyoruz.';

  return { risks, message, tips };
}

// === Page Component ===

const QUICK_STEP_IDS = ['diet', 'symptoms', 'gender_age'];

export default function NutritionAnalysisPage() {
  const [mode, setMode] = useState<'intro' | 'quick' | 'detailed'>('intro');
  const [result, setResult] = useState<ReturnType<typeof analyzeNutrition> | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);

  const activeSteps = mode === 'quick' ? STEPS.filter(s => QUICK_STEP_IDS.includes(s.id)) : STEPS;

  // Fetch recommended products based on quiz results
  useEffect(() => {
    if (!result) return;
    const highRiskNutrients = result.risks.filter(r => r.risk === 'high' || r.risk === 'medium').map(r => r.nutrient);
    const slugs = highRiskNutrients.flatMap(n => NUTRIENT_SLUG_MAP[n] || []).slice(0, 3);
    if (slugs.length === 0) return;

    Promise.all(
      slugs.map(slug =>
        api.get<{ data: RecommendedProduct[] }>(`/products?ingredient_slug=${slug}&domain_type=supplement&limit=2`)
          .then(res => res.data || [])
          .catch(() => [] as RecommendedProduct[])
      )
    ).then(results => {
      const unique = new Map<number, RecommendedProduct>();
      results.flat().forEach(p => { if (!unique.has(p.product_id)) unique.set(p.product_id, p); });
      setRecommendedProducts([...unique.values()].slice(0, 6));
    });
  }, [result]);

  if (result) {
    const highRisks = result.risks.filter((r) => r.risk === 'high');
    const mediumRisks = result.risks.filter((r) => r.risk === 'medium');
    const lowRisks = result.risks.filter((r) => r.risk === 'low');

    const resultData: QuizResultData = {
      headline: 'Beslenme Analizi Sonuçların',
      subheadline: result.message,
      sections: [
        ...(highRisks.length > 0
          ? [{
              title: 'Yüksek Risk',
              icon: 'warning',
              items: highRisks.map((r) => ({
                label: r.nutrient,
                detail: r.reasons.join(' • '),
                type: 'negative' as const,
              })),
            }]
          : []),
        ...(mediumRisks.length > 0
          ? [{
              title: 'Orta Risk',
              icon: 'info',
              items: mediumRisks.map((r) => ({
                label: r.nutrient,
                detail: r.reasons.join(' • '),
                type: 'neutral' as const,
              })),
            }]
          : []),
        ...(lowRisks.length > 0
          ? [{
              title: 'Düşük Risk',
              icon: 'check_circle',
              items: lowRisks.map((r) => ({
                label: r.nutrient,
                detail: r.reasons.join(' • '),
                type: 'positive' as const,
              })),
            }]
          : []),
        {
          title: 'Öneriler',
          icon: 'tips_and_updates',
          items: result.tips.map((t) => ({
            label: t.label,
            detail: t.detail,
            type: 'neutral' as const,
          })),
        },
      ],
      cta: { label: 'Takviyeleri Keşfet', href: '/takviyeler' },
      secondaryCta: { label: 'Tekrar Dene', href: '/beslenme-analizi' },
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Beslenme Analizi</span>
        </nav>
        <QuizResult data={resultData} />

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="max-w-2xl mx-auto mt-10">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">medication</span>
              Sana Özel Takviye Önerileri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedProducts.map(p => (
                <Link
                  key={p.product_id}
                  href={`/takviyeler/${p.product_slug}`}
                  className="curator-card group overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-surface-container-low flex items-center justify-center overflow-hidden">
                    {p.images?.[0]?.image_url ? (
                      <img src={p.images[0].image_url} alt={p.product_name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <span className="material-icon text-outline-variant" style={{ fontSize: '48px' }} aria-hidden="true">medication</span>
                    )}
                  </div>
                  <div className="p-4">
                    {p.brand && <p className="label-caps text-outline truncate mb-1">{p.brand.brand_name}</p>}
                    <h4 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">{p.product_name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">Beslenme Analizi</span>
      </nav>

      {mode === 'intro' ? (
        <div className="max-w-2xl mx-auto text-center py-8">
          <span className="material-icon text-primary mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">nutrition</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-2">BESLENME ANALİZİ</h1>
          <p className="text-on-surface-variant text-sm mb-10">Eksik olan ne? Beden konuşuyor, biz dinliyoruz.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <button onClick={() => setMode('quick')} className="curator-card p-6 text-left group hover:border-primary/30 transition-all">
              <span className="material-icon text-primary text-[28px] mb-3 block" aria-hidden="true">bolt</span>
              <p className="font-semibold text-on-surface">Hızlı Test</p>
              <p className="text-xs text-on-surface-variant mt-1">3 soru, ~1 dakika</p>
              <p className="text-xs text-outline mt-2">Anında sonuç al</p>
            </button>
            <button onClick={() => setMode('detailed')} className="curator-card p-6 text-left group hover:border-primary/30 transition-all">
              <span className="material-icon text-primary text-[28px] mb-3 block" aria-hidden="true">science</span>
              <p className="font-semibold text-on-surface">Detaylı Analiz</p>
              <p className="text-xs text-on-surface-variant mt-1">6 soru, ~3 dakika</p>
              <p className="text-xs text-outline mt-2">Daha doğru sonuçlar</p>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
            <p className="label-caps text-outline mb-3 tracking-[0.4em]">Bilimsel Analiz</p>
            <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
              BESLENME ANALİZİ
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              {mode === 'quick' ? '3 soruda hızlı takviye ihtiyacını öğren.' : '6 soruda eksiklik riskin.'}
            </p>
          </div>

          <QuizEngine
            config={{
              quizId: 'nutrition',
              title: 'Beslenme Analizi',
              subtitle: mode === 'quick' ? '3 soruda hızlı sonuç' : '6 soruda eksiklik riskin',
              steps: activeSteps,
              onComplete: (answers) => {
                const res = analyzeNutrition(answers);
                setResult(res);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
            }}
          />
        </>
      )}
    </div>
  );
}
