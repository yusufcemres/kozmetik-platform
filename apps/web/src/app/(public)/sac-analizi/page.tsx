'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';
import { api } from '@/lib/api';

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
    id: 'hair_type',
    question: 'Saç tipin nasıl?',
    type: 'single',
    options: [
      { value: 'straight', label: 'Düz', icon: 'straighten' },
      { value: 'wavy', label: 'Dalgalı', icon: 'waves' },
      { value: 'curly', label: 'Kıvırcık', icon: 'curly_hair' },
      { value: 'coily', label: 'Afro kıvırcık', icon: 'change_history' },
    ],
  },
  {
    id: 'scalp',
    question: 'Saç derisi durumun nasıl?',
    type: 'single',
    options: [
      { value: 'normal', label: 'Normal', description: 'Dengeli, sorunsuz', icon: 'check_circle' },
      { value: 'oily', label: 'Yağlı', description: 'Günde yıkamak gerekiyor', icon: 'water_drop' },
      { value: 'dry', label: 'Kuru', description: 'Kaşıntı, gerginlik hissi', icon: 'air' },
      { value: 'combination', label: 'Karma', description: 'Kökler yağlı, uçlar kuru', icon: 'contrast' },
      { value: 'sensitive', label: 'Hassas', description: 'Kızarıklık, tahriş', icon: 'warning_amber' },
      { value: 'dandruff', label: 'Kepekli', description: 'Beyaz/sarı pullanma', icon: 'grain' },
    ],
  },
  {
    id: 'problems',
    question: 'Saç sorunların neler?',
    description: 'En çok rahatsız edenleri seç.',
    type: 'multi',
    maxSelections: 4,
    options: [
      { value: 'hair_loss', label: 'Dökülme / seyrelme', icon: 'face_retouching_off' },
      { value: 'breakage', label: 'Kırılma / çatallanma', icon: 'broken_image' },
      { value: 'dull', label: 'Mat ve cansız görünüm', icon: 'blur_on' },
      { value: 'no_volume', label: 'Hacim eksikliği', icon: 'unfold_less' },
      { value: 'frizz', label: 'Elektriklenme / kabarma', icon: 'electric_bolt' },
      { value: 'slow_growth', label: 'Yavaş uzama', icon: 'hourglass_empty' },
      { value: 'color_fade', label: 'Renk solması (boyalı saç)', icon: 'palette' },
      { value: 'excess_oil', label: 'Aşırı yağlanma', icon: 'opacity' },
    ],
  },
  {
    id: 'chemical',
    question: 'Kimyasal işlem geçmişin var mı?',
    type: 'single',
    options: [
      { value: 'none', label: 'Hiç işlem yok (doğal)', icon: 'eco' },
      { value: 'color', label: 'Boya / röfle (düzenli)', icon: 'palette' },
      { value: 'keratin', label: 'Keratin / düzleştirme', icon: 'straighten' },
      { value: 'perm', label: 'Perma', icon: 'change_history' },
      { value: 'bleach', label: 'Ağartma / decolor', icon: 'light_mode' },
      { value: 'multiple', label: 'Birden fazla işlem', icon: 'layers' },
    ],
  },
  {
    id: 'goals',
    question: 'Saç bakım hedeflerin neler?',
    description: 'En önemli 3 hedefini seç.',
    type: 'multi',
    maxSelections: 3,
    options: [
      { value: 'stronger', label: 'Daha güçlü saçlar', icon: 'shield' },
      { value: 'shiny', label: 'Daha parlak saçlar', icon: 'auto_awesome' },
      { value: 'volume', label: 'Daha hacimli', icon: 'unfold_more' },
      { value: 'growth', label: 'Daha hızlı uzama', icon: 'trending_up' },
      { value: 'less_loss', label: 'Daha az dökülme', icon: 'verified' },
      { value: 'dandruff_control', label: 'Kepek kontrolü', icon: 'cleaning_services' },
      { value: 'color_protection', label: 'Renk koruma', icon: 'palette' },
      { value: 'moisture', label: 'Nem & yumuşaklık', icon: 'water_drop' },
    ],
  },
];

// === Analysis ===

interface HairRecommendation {
  category: string;
  tip: string;
}

function analyzeHair(answers: QuizAnswers): {
  profile: { label: string; value: string }[];
  recommendations: HairRecommendation[];
  supplementTips: { label: string; detail: string }[];
  routineTips: { label: string; detail: string }[];
} {
  const hairType = answers.hair_type as string;
  const scalp = answers.scalp as string;
  const problems = (answers.problems as string[]) || [];
  const chemical = answers.chemical as string;
  const goals = (answers.goals as string[]) || [];

  const profile: { label: string; value: string }[] = [
    { label: 'Saç Tipi', value: { straight: 'Düz', wavy: 'Dalgalı', curly: 'Kıvırcık', coily: 'Afro Kıvırcık' }[hairType] || hairType },
    { label: 'Saç Derisi', value: { normal: 'Normal', oily: 'Yağlı', dry: 'Kuru', combination: 'Karma', sensitive: 'Hassas', dandruff: 'Kepekli' }[scalp] || scalp },
    { label: 'Kimyasal İşlem', value: { none: 'Yok', color: 'Boya/Röfle', keratin: 'Keratin', perm: 'Perma', bleach: 'Ağartma', multiple: 'Çoklu işlem' }[chemical] || chemical },
  ];

  const recommendations: HairRecommendation[] = [];
  const supplementTips: { label: string; detail: string }[] = [];
  const routineTips: { label: string; detail: string }[] = [];

  // Scalp-based recommendations
  if (scalp === 'oily') {
    recommendations.push({ category: 'Şampuan', tip: 'Saç derisi temizleyici (clarifying) şampuan haftada 1-2 kez kullan. Günlük için hafif, sülfatsız şampuan tercih et.' });
    routineTips.push({ label: 'Yıkama sıklığı', detail: 'Günde bir veya gün aşırı yıka. Çok sık yıkama yağlanmayı artırabilir.' });
  } else if (scalp === 'dry') {
    recommendations.push({ category: 'Şampuan', tip: 'Nemlendirici, sülfatsız şampuan kullan. Haftada 2-3 kez yıkamak yeterli.' });
    routineTips.push({ label: 'Nem desteği', detail: 'Yıkama öncesi hindistancevizi yağı veya argan yağı uygula.' });
  } else if (scalp === 'dandruff') {
    recommendations.push({ category: 'Şampuan', tip: 'Çinko pirition veya ketokonazol içeren anti-kepek şampuan kullan.' });
  }

  // Problem-based
  if (problems.includes('hair_loss')) {
    recommendations.push({ category: 'Serum', tip: 'Kafein, biotin veya peptit içeren saç serumu kullan. Haftada 2 kez saç derisi masajı yap.' });
    supplementTips.push({ label: 'Biotin', detail: 'Saç büyümesini destekler. Günlük 2500-5000 mcg önerilen doz.' });
    supplementTips.push({ label: 'Demir + Çinko', detail: 'Saç dökülmesinde sık görülen eksiklikler. Kan testi ile kontrol et.' });
  }
  if (problems.includes('breakage')) {
    recommendations.push({ category: 'Bakım', tip: 'Protein içeren saç maskesi haftada 1 kez kullan. Isıl aletleri azalt ve ısı koruyucu kullan.' });
    routineTips.push({ label: 'Sıcaklık', detail: 'Fön makinesi düşük derecede kullan (max 180°C). Havlu ile ovmayı bırak.' });
  }
  if (problems.includes('dull')) {
    recommendations.push({ category: 'Parlaklık', tip: 'Soğuk su ile son durulama yap. Parlaklık veren serum veya sprey kullan.' });
  }
  if (problems.includes('frizz') || hairType === 'curly' || hairType === 'coily') {
    recommendations.push({ category: 'Nem', tip: 'Leave-in conditioner ve anti-frizz serum kullan. Pamuklu yastık kılıfı yerine saten tercih et.' });
  }

  // Chemical treatment
  if (chemical !== 'none') {
    recommendations.push({ category: 'Onarım', tip: 'Kimyasal işlem görmüş saçlar için onarıcı maske haftada 1-2 kez kullan. Bond-repair ürünleri dene.' });
    if (chemical === 'bleach' || chemical === 'multiple') {
      routineTips.push({ label: 'Dikkat', detail: 'Ağır kimyasal işlemlerden en az 6-8 hafta ara ver. Protein-nem dengesini koru.' });
    }
  }

  // General routine tip
  routineTips.push({ label: 'Kurutma', detail: 'Mikrofiber havlu ile fazla nemi al, doğal kurutmayı tercih et.' });

  return { profile, recommendations, supplementTips, routineTips };
}

// === Page Component ===

const QUICK_STEP_IDS = ['hair_type', 'problems', 'goals'];

export default function HairAnalysisPage() {
  const [mode, setMode] = useState<'intro' | 'quick' | 'detailed'>('intro');
  const [result, setResult] = useState<ReturnType<typeof analyzeHair> | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);

  const activeSteps = mode === 'quick' ? STEPS.filter(s => QUICK_STEP_IDS.includes(s.id)) : STEPS;

  // Fetch recommended products based on supplement tips
  useEffect(() => {
    if (!result || result.supplementTips.length === 0) return;
    const slugs = ['biotin', 'zinc', 'iron'].slice(0, 3);

    Promise.all(
      slugs.map(slug =>
        api.get<{ data: RecommendedProduct[] }>(`/products?ingredient_slug=${slug}&domain_type=supplement&limit=2`)
          .then(res => res.data || [])
          .catch(() => [] as RecommendedProduct[])
      )
    ).then(results => {
      const unique = new Map<number, RecommendedProduct>();
      results.flat().forEach(p => { if (!unique.has(p.product_id)) unique.set(p.product_id, p); });
      setRecommendedProducts([...unique.values()].slice(0, 4));
    });
  }, [result]);

  if (result) {
    const resultData: QuizResultData = {
      headline: 'Saç Analizi Sonuçların',
      subheadline: 'Saçın için kişisel bakım planı hazırladık.',
      sections: [
        {
          title: 'Saç Profilin',
          icon: 'person',
          items: result.profile.map((p) => ({
            label: `${p.label}: ${p.value}`,
            type: 'neutral' as const,
          })),
        },
        {
          title: 'Ürün Önerileri',
          icon: 'spa',
          items: result.recommendations.map((r) => ({
            label: r.category,
            detail: r.tip,
            type: 'positive' as const,
          })),
        },
        ...(result.supplementTips.length > 0
          ? [{
              title: 'Takviye Önerileri',
              icon: 'medication',
              items: result.supplementTips.map((t) => ({
                label: t.label,
                detail: t.detail,
                type: 'neutral' as const,
              })),
            }]
          : []),
        {
          title: 'Bakım Rutini İpuçları',
          icon: 'tips_and_updates',
          items: result.routineTips.map((t) => ({
            label: t.label,
            detail: t.detail,
            type: 'neutral' as const,
          })),
        },
      ],
      cta: { label: 'Ürünleri Keşfet', href: '/urunler' },
      secondaryCta: { label: 'Tekrar Dene', href: '/sac-analizi' },
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Saç Analizi</span>
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
        <span className="text-on-surface font-medium">Saç Analizi</span>
      </nav>

      {mode === 'intro' ? (
        <div className="max-w-2xl mx-auto text-center py-8">
          <span className="material-icon text-primary mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">face_retouching_natural</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-2">SAÇ ANALİZİ</h1>
          <p className="text-on-surface-variant text-sm mb-10">Saçın sana bir şeyler anlatıyor. Biz tercüme ediyoruz.</p>

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
              <p className="text-xs text-on-surface-variant mt-1">5 soru, ~2 dakika</p>
              <p className="text-xs text-outline mt-2">Daha doğru sonuçlar</p>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
            <p className="label-caps text-outline mb-3 tracking-[0.4em]">Kişisel Analiz</p>
            <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
              SAÇ ANALİZİ
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              {mode === 'quick' ? '3 soruda hızlı saç bakım önerileri.' : '5 soruda kişisel saç bakım planın.'}
            </p>
          </div>

          <QuizEngine
            config={{
              quizId: 'hair',
              title: 'Saç Analizi',
              subtitle: mode === 'quick' ? '3 soruda hızlı sonuç' : '5 soruda saç bakım planı',
              steps: activeSteps,
              onComplete: (answers) => {
                const res = analyzeHair(answers);
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
