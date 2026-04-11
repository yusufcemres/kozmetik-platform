'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';

// === Quiz Steps ===

const STEPS: QuizStep[] = [
  {
    id: 'hair_type',
    question: 'Sac tipin nasil?',
    type: 'single',
    options: [
      { value: 'straight', label: 'Duz', icon: 'straighten' },
      { value: 'wavy', label: 'Dalgali', icon: 'waves' },
      { value: 'curly', label: 'Kivirck', icon: 'curly_hair' },
      { value: 'coily', label: 'Afro kivircik', icon: 'change_history' },
    ],
  },
  {
    id: 'scalp',
    question: 'Sac derisi durumun nasil?',
    type: 'single',
    options: [
      { value: 'normal', label: 'Normal', description: 'Dengeli, sorunsuz', icon: 'check_circle' },
      { value: 'oily', label: 'Yagli', description: 'Gunde yikamak gerekiyor', icon: 'water_drop' },
      { value: 'dry', label: 'Kuru', description: 'Kasinti, gerginlik hissi', icon: 'air' },
      { value: 'combination', label: 'Karma', description: 'Kokler yagli, uclar kuru', icon: 'contrast' },
      { value: 'sensitive', label: 'Hassas', description: 'Kizariklik, tahris', icon: 'warning_amber' },
      { value: 'dandruff', label: 'Kepekli', description: 'Beyaz/sari pullanma', icon: 'grain' },
    ],
  },
  {
    id: 'problems',
    question: 'Sac sorunlarin neler?',
    description: 'En cok rahatsiz edenleri sec.',
    type: 'multi',
    maxSelections: 4,
    options: [
      { value: 'hair_loss', label: 'Dokulme / seyrelme', icon: 'face_retouching_off' },
      { value: 'breakage', label: 'Kirilma / catallanma', icon: 'broken_image' },
      { value: 'dull', label: 'Mat ve cansiz gorunum', icon: 'blur_on' },
      { value: 'no_volume', label: 'Hacim eksikligi', icon: 'unfold_less' },
      { value: 'frizz', label: 'Elektriklenme / kabarma', icon: 'electric_bolt' },
      { value: 'slow_growth', label: 'Yavas uzama', icon: 'hourglass_empty' },
      { value: 'color_fade', label: 'Renk solmasi (boyali sac)', icon: 'palette' },
      { value: 'excess_oil', label: 'Asiri yaglanma', icon: 'opacity' },
    ],
  },
  {
    id: 'chemical',
    question: 'Kimyasal islem gecmisin var mi?',
    type: 'single',
    options: [
      { value: 'none', label: 'Hic islem yok (dogal)', icon: 'eco' },
      { value: 'color', label: 'Boya / rofle (duzenli)', icon: 'palette' },
      { value: 'keratin', label: 'Keratin / duzlestirme', icon: 'straighten' },
      { value: 'perm', label: 'Perma', icon: 'change_history' },
      { value: 'bleach', label: 'Agartma / decolor', icon: 'light_mode' },
      { value: 'multiple', label: 'Birden fazla islem', icon: 'layers' },
    ],
  },
  {
    id: 'goals',
    question: 'Sac bakim hedeflerin neler?',
    description: 'En onemli 3 hedefini sec.',
    type: 'multi',
    maxSelections: 3,
    options: [
      { value: 'stronger', label: 'Daha guclu saclar', icon: 'shield' },
      { value: 'shiny', label: 'Daha parlak saclar', icon: 'auto_awesome' },
      { value: 'volume', label: 'Daha hacimli', icon: 'unfold_more' },
      { value: 'growth', label: 'Daha hizli uzama', icon: 'trending_up' },
      { value: 'less_loss', label: 'Daha az dokulme', icon: 'verified' },
      { value: 'dandruff_control', label: 'Kepek kontrolu', icon: 'cleaning_services' },
      { value: 'color_protection', label: 'Renk koruma', icon: 'palette' },
      { value: 'moisture', label: 'Nem & yumusaklik', icon: 'water_drop' },
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
    { label: 'Sac Tipi', value: { straight: 'Duz', wavy: 'Dalgali', curly: 'Kivircik', coily: 'Afro Kivircik' }[hairType] || hairType },
    { label: 'Sac Derisi', value: { normal: 'Normal', oily: 'Yagli', dry: 'Kuru', combination: 'Karma', sensitive: 'Hassas', dandruff: 'Kepekli' }[scalp] || scalp },
    { label: 'Kimyasal Islem', value: { none: 'Yok', color: 'Boya/Rofle', keratin: 'Keratin', perm: 'Perma', bleach: 'Agartma', multiple: 'Coklu islem' }[chemical] || chemical },
  ];

  const recommendations: HairRecommendation[] = [];
  const supplementTips: { label: string; detail: string }[] = [];
  const routineTips: { label: string; detail: string }[] = [];

  // Scalp-based recommendations
  if (scalp === 'oily') {
    recommendations.push({ category: 'Sampuan', tip: 'Sac derisi temizleyici (clarifying) sampuan haftada 1-2 kez kullan. Gunluk icin hafif, sulfatsiz sampuan tercih et.' });
    routineTips.push({ label: 'Yikama sikligi', detail: 'Gunde bir veya gun asiri yika. Cok sik yikama yaglanmayi artirabilir.' });
  } else if (scalp === 'dry') {
    recommendations.push({ category: 'Sampuan', tip: 'Nemlendirici, sulfatsiz sampuan kullan. Haftada 2-3 kez yikamak yeterli.' });
    routineTips.push({ label: 'Nem destegi', detail: 'Yikama oncesi hindistancevizi yagi veya argan yagi uygula.' });
  } else if (scalp === 'dandruff') {
    recommendations.push({ category: 'Sampuan', tip: 'Cinko pirition veya ketokonazol iceren anti-kepek sampuan kullan.' });
  }

  // Problem-based
  if (problems.includes('hair_loss')) {
    recommendations.push({ category: 'Serum', tip: 'Kafein, biotin veya peptit iceren sac serumu kullan. Haftada 2 kez sac derisi masaji yap.' });
    supplementTips.push({ label: 'Biotin', detail: 'Sac buyumesini destekler. Gunluk 2500-5000 mcg onerilen doz.' });
    supplementTips.push({ label: 'Demir + Cinko', detail: 'Sac dokulmesinde sik gorulen eksiklikler. Kan testi ile kontrol et.' });
  }
  if (problems.includes('breakage')) {
    recommendations.push({ category: 'Bakim', tip: 'Protein iceren sac maskesi haftada 1 kez kullan. Isil aletleri azalt ve isi koruyucu kullan.' });
    routineTips.push({ label: 'Sicaklik', detail: 'Fon makinesi dusuk derecede kullan (max 180°C). Havlu ile ovmayi birak.' });
  }
  if (problems.includes('dull')) {
    recommendations.push({ category: 'Parlaklik', tip: 'Soguk su ile son durulama yap. Parlaklik veren serum veya sprey kullan.' });
  }
  if (problems.includes('frizz') || hairType === 'curly' || hairType === 'coily') {
    recommendations.push({ category: 'Nem', tip: 'Leave-in conditioner ve anti-frizz serum kullan. Pamuklu yastik kilifi yerine saten tercih et.' });
  }

  // Chemical treatment
  if (chemical !== 'none') {
    recommendations.push({ category: 'Onarim', tip: 'Kimyasal islem gormus saclar icin onarici maske haftada 1-2 kez kullan. Bond-repair urunleri dene.' });
    if (chemical === 'bleach' || chemical === 'multiple') {
      routineTips.push({ label: 'Dikkat', detail: 'Agir kimyasal islemlerden en az 6-8 hafta ara ver. Protein-nem dengesini koru.' });
    }
  }

  // General routine tip
  routineTips.push({ label: 'Kurutma', detail: 'Mikrofiber havlu ile fazla nemi al, dogal kurutmayi tercih et.' });

  return { profile, recommendations, supplementTips, routineTips };
}

// === Page Component ===

export default function HairAnalysisPage() {
  const [result, setResult] = useState<ReturnType<typeof analyzeHair> | null>(null);

  if (result) {
    const resultData: QuizResultData = {
      headline: 'Sac Analizi Sonuclarin',
      subheadline: 'Sacin icin kisisel bakim plani hazirladik.',
      sections: [
        {
          title: 'Sac Profilin',
          icon: 'person',
          items: result.profile.map((p) => ({
            label: `${p.label}: ${p.value}`,
            type: 'neutral' as const,
          })),
        },
        {
          title: 'Urun Onerileri',
          icon: 'spa',
          items: result.recommendations.map((r) => ({
            label: r.category,
            detail: r.tip,
            type: 'positive' as const,
          })),
        },
        ...(result.supplementTips.length > 0
          ? [{
              title: 'Takviye Onerileri',
              icon: 'medication',
              items: result.supplementTips.map((t) => ({
                label: t.label,
                detail: t.detail,
                type: 'neutral' as const,
              })),
            }]
          : []),
        {
          title: 'Bakim Rutini Ipuclari',
          icon: 'tips_and_updates',
          items: result.routineTips.map((t) => ({
            label: t.label,
            detail: t.detail,
            type: 'neutral' as const,
          })),
        },
      ],
      cta: { label: 'Urunleri Kesfet', href: '/urunler' },
      secondaryCta: { label: 'Tekrar Dene', href: '/sac-analizi' },
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Sac Analizi</span>
        </nav>
        <QuizResult data={resultData} />
      </div>
    );
  }

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">Sac Analizi</span>
      </nav>

      <div className="text-center mb-12">
        <p className="label-caps text-outline mb-3 tracking-[0.4em]">Kisisel Analiz</p>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
          SAÇ ANALİZİ
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Sacin sana bir seyler anlatiyor. Biz tercume ediyoruz. 5 soruda sac bakim planin.
        </p>
      </div>

      <QuizEngine
        config={{
          quizId: 'hair',
          title: 'Sac Analizi',
          subtitle: '5 soruda sac bakim plani',
          steps: STEPS,
          onComplete: (answers) => {
            const res = analyzeHair(answers);
            setResult(res);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        }}
      />
    </div>
  );
}
