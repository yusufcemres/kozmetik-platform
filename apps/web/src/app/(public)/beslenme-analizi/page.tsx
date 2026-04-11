'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';

// === Quiz Steps ===

const STEPS: QuizStep[] = [
  {
    id: 'diet',
    question: 'Beslenme tipin nasil?',
    type: 'single',
    options: [
      { value: 'mixed', label: 'Karisik', description: 'Her seyi yerim', icon: 'restaurant' },
      { value: 'vegetarian', label: 'Vejeteryan', description: 'Et yemem, yumurta/sut OK', icon: 'eco' },
      { value: 'vegan', label: 'Vegan', description: 'Hicbir hayvansal urun', icon: 'spa' },
      { value: 'pescatarian', label: 'Pesketaryen', description: 'Balik + sebze', icon: 'set_meal' },
      { value: 'gluten_free', label: 'Glutensiz', description: 'Gluten iceren gidalari yemem', icon: 'no_food' },
      { value: 'lactose_free', label: 'Laktoz intoleransi', description: 'Sut urunlerini tuketemem', icon: 'no_drinks' },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Yasam tarzi nasil?',
    type: 'single',
    options: [
      { value: 'sedentary', label: 'Sedanter', description: 'Masa basi is, az hareket', icon: 'weekend' },
      { value: 'moderate', label: 'Orta aktif', description: 'Haftada 2-3 gun spor', icon: 'directions_walk' },
      { value: 'active', label: 'Cok aktif', description: 'Gunluk spor veya fiziksel is', icon: 'directions_run' },
      { value: 'athlete', label: 'Sporcu', description: 'Profesyonel veya yogun antrenman', icon: 'fitness_center' },
    ],
  },
  {
    id: 'symptoms',
    question: 'Hangi belirtileri yasiyorsun?',
    description: 'Seni en cok rahatsiz edenleri sec.',
    type: 'multi',
    maxSelections: 5,
    options: [
      { value: 'fatigue', label: 'Yorgunluk & enerji dusukluğu', icon: 'battery_low' },
      { value: 'immunity', label: 'Sik hastalanma', icon: 'coronavirus' },
      { value: 'joint_pain', label: 'Eklem / kas agrisi', icon: 'accessibility_new' },
      { value: 'sleep_issues', label: 'Uyku problemi', icon: 'bedtime_off' },
      { value: 'hair_loss', label: 'Sac dokulmesi', icon: 'face_retouching_off' },
      { value: 'digestion', label: 'Sindirim sorunlari', icon: 'gastroenterology' },
      { value: 'stress', label: 'Stres / kaygi', icon: 'psychology' },
      { value: 'focus', label: 'Konsantrasyon guclugu', icon: 'lightbulb' },
      { value: 'skin_issues', label: 'Cilt sorunlari', icon: 'dermatology' },
      { value: 'bone_issues', label: 'Kemik / dis sorunlari', icon: 'healing' },
    ],
  },
  {
    id: 'gender_age',
    question: 'Cinsiyet ve yas aralin?',
    type: 'single',
    options: [
      { value: 'female_18-25', label: 'Kadin — 18-25' },
      { value: 'female_26-35', label: 'Kadin — 26-35' },
      { value: 'female_36-45', label: 'Kadin — 36-45' },
      { value: 'female_46-55', label: 'Kadin — 46-55' },
      { value: 'female_55+', label: 'Kadin — 55+' },
      { value: 'male_18-25', label: 'Erkek — 18-25' },
      { value: 'male_26-35', label: 'Erkek — 26-35' },
      { value: 'male_36-45', label: 'Erkek — 36-45' },
      { value: 'male_46-55', label: 'Erkek — 46-55' },
      { value: 'male_55+', label: 'Erkek — 55+' },
    ],
  },
  {
    id: 'current_supplements',
    question: 'Su an takviye kullaniyor musun?',
    type: 'single',
    options: [
      { value: 'none', label: 'Hic kullanmiyorum', icon: 'close' },
      { value: 'multivitamin', label: 'Multivitamin aliyorum', icon: 'medication' },
      { value: 'specific', label: 'Belirli takviyeler kullaniyorum', icon: 'science' },
      { value: 'irregular', label: 'Duzenli degil, ara sira', icon: 'schedule' },
    ],
  },
  {
    id: 'budget',
    question: 'Aylik takviye butcen ne kadar?',
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
  if (diet === 'vegan') dReasons.push('Vegan diyette D vitamini kaynagi sinirli');
  if (lifestyle === 'sedentary') dReasons.push('Gunes isigi yetersizligi (masa basi calisma)');
  if (age === '46-55' || age === '55+') dReasons.push('Yasla birlikte D vitamini sentezi azalir');
  if (dReasons.length >= 2) risks.push({ nutrient: 'D Vitamini', risk: 'high', reasons: dReasons });
  else if (dReasons.length === 1) risks.push({ nutrient: 'D Vitamini', risk: 'medium', reasons: dReasons });

  // B12
  const b12Reasons: string[] = [];
  if (diet === 'vegan') b12Reasons.push('Vegan diyette B12 kaynagi yok');
  if (diet === 'vegetarian') b12Reasons.push('Vejeteryan diyette B12 sinirli');
  if (symptoms.includes('fatigue')) b12Reasons.push('Yorgunluk belirtisi');
  if (symptoms.includes('focus')) b12Reasons.push('Konsantrasyon guclugu');
  if (b12Reasons.length >= 2) risks.push({ nutrient: 'B12 Vitamini', risk: 'high', reasons: b12Reasons });
  else if (b12Reasons.length === 1) risks.push({ nutrient: 'B12 Vitamini', risk: 'medium', reasons: b12Reasons });

  // Omega-3
  const omegaReasons: string[] = [];
  if (diet === 'vegan' || diet === 'vegetarian') omegaReasons.push('Balik tuketimi yok');
  if (symptoms.includes('joint_pain')) omegaReasons.push('Eklem agrisi');
  if (symptoms.includes('focus')) omegaReasons.push('Konsantrasyon guclugu');
  if (symptoms.includes('skin_issues')) omegaReasons.push('Cilt sorunlari');
  if (omegaReasons.length >= 2) risks.push({ nutrient: 'Omega-3', risk: 'high', reasons: omegaReasons });
  else if (omegaReasons.length === 1) risks.push({ nutrient: 'Omega-3', risk: 'medium', reasons: omegaReasons });

  // Demir
  const ironReasons: string[] = [];
  if (gender === 'female' && (age === '18-25' || age === '26-35' || age === '36-45'))
    ironReasons.push('Kadin — ureme caginda demir kaybi');
  if (diet === 'vegan') ironReasons.push('Bitkisel demir emilimi dusuk');
  if (symptoms.includes('fatigue')) ironReasons.push('Yorgunluk belirtisi');
  if (symptoms.includes('hair_loss')) ironReasons.push('Sac dokulmesi');
  if (ironReasons.length >= 2) risks.push({ nutrient: 'Demir', risk: 'high', reasons: ironReasons });
  else if (ironReasons.length === 1) risks.push({ nutrient: 'Demir', risk: 'medium', reasons: ironReasons });

  // Magnezyum
  const mgReasons: string[] = [];
  if (symptoms.includes('sleep_issues')) mgReasons.push('Uyku problemi');
  if (symptoms.includes('stress')) mgReasons.push('Stres / kaygi');
  if (symptoms.includes('joint_pain')) mgReasons.push('Kas agrisi');
  if (lifestyle === 'athlete' || lifestyle === 'active') mgReasons.push('Yogun fiziksel aktivite');
  if (mgReasons.length >= 2) risks.push({ nutrient: 'Magnezyum', risk: 'high', reasons: mgReasons });
  else if (mgReasons.length === 1) risks.push({ nutrient: 'Magnezyum', risk: 'medium', reasons: mgReasons });

  // Probiyotik
  if (symptoms.includes('digestion')) {
    risks.push({ nutrient: 'Probiyotik', risk: 'high', reasons: ['Sindirim sorunlari'] });
  }
  if (symptoms.includes('immunity')) {
    risks.push({ nutrient: 'Probiyotik', risk: 'medium', reasons: ['Bagisiklik destegi'] });
  }

  // C Vitamini
  const cReasons: string[] = [];
  if (symptoms.includes('immunity')) cReasons.push('Sik hastalanma');
  if (symptoms.includes('skin_issues')) cReasons.push('Cilt sorunlari');
  if (cReasons.length > 0) risks.push({ nutrient: 'C Vitamini', risk: cReasons.length >= 2 ? 'high' : 'low', reasons: cReasons });

  // Cink
  const zincReasons: string[] = [];
  if (symptoms.includes('hair_loss')) zincReasons.push('Sac dokulmesi');
  if (symptoms.includes('immunity')) zincReasons.push('Sik hastalanma');
  if (symptoms.includes('skin_issues')) zincReasons.push('Cilt sorunlari');
  if (zincReasons.length >= 2) risks.push({ nutrient: 'Cinko', risk: 'medium', reasons: zincReasons });

  // Kalsiyum
  if (diet === 'vegan' || diet === 'lactose_free') {
    const calcReasons = [diet === 'vegan' ? 'Vegan beslenme' : 'Laktoz intoleransi'];
    if (symptoms.includes('bone_issues')) calcReasons.push('Kemik sorunlari');
    risks.push({ nutrient: 'Kalsiyum', risk: calcReasons.length >= 2 ? 'high' : 'medium', reasons: calcReasons });
  }

  // Sort by risk priority
  const order = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => order[a.risk] - order[b.risk]);

  // General tips
  if (diet === 'vegan') tips.push({ label: 'Vegan beslenme destegi', detail: 'B12, D3, Omega-3 (alg bazli) ve demir takviyesi duzenli alinmalidir.' });
  if (lifestyle === 'athlete') tips.push({ label: 'Sporcu takviyesi', detail: 'Yogun antrenman magnezyum, cinko ve elektrolit ihtiyacini artirir.' });
  if (age === '55+') tips.push({ label: 'Yas ilerledikce', detail: 'D vitamini, B12 ve kalsiyum emilimi yasla azalir. Duzenli kontrol onemlidir.' });
  tips.push({ label: 'Genel oneri', detail: 'Takviye kullanmadan once doktorunuza danisin. Kan testi en kesin sonucu verir.' });

  const highCount = risks.filter((r) => r.risk === 'high').length;
  let message: string;
  if (highCount === 0) message = 'Genel olarak iyi durumdasin. Birkac kucuk iyilestirme yeterli.';
  else if (highCount <= 2) message = 'Birkac onemli eksiklik riski tespit ettik. Detaylara goz at.';
  else message = 'Beslenme profiline gore birden fazla yuksek riskli eksiklik var. Kan testi oneriyoruz.';

  return { risks, message, tips };
}

// === Page Component ===

export default function NutritionAnalysisPage() {
  const [result, setResult] = useState<ReturnType<typeof analyzeNutrition> | null>(null);

  if (result) {
    const highRisks = result.risks.filter((r) => r.risk === 'high');
    const mediumRisks = result.risks.filter((r) => r.risk === 'medium');
    const lowRisks = result.risks.filter((r) => r.risk === 'low');

    const resultData: QuizResultData = {
      headline: 'Beslenme Analizi Sonuclarin',
      subheadline: result.message,
      sections: [
        ...(highRisks.length > 0
          ? [{
              title: 'Yuksek Risk',
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
              title: 'Dusuk Risk',
              icon: 'check_circle',
              items: lowRisks.map((r) => ({
                label: r.nutrient,
                detail: r.reasons.join(' • '),
                type: 'positive' as const,
              })),
            }]
          : []),
        {
          title: 'Oneriler',
          icon: 'tips_and_updates',
          items: result.tips.map((t) => ({
            label: t.label,
            detail: t.detail,
            type: 'neutral' as const,
          })),
        },
      ],
      cta: { label: 'Takviyeleri Kesfet', href: '/takviyeler' },
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

      <div className="text-center mb-12">
        <p className="label-caps text-outline mb-3 tracking-[0.4em]">Bilimsel Analiz</p>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
          BESLENME ANALİZİ
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Eksik olan ne? Beden konusuyor, biz dinliyoruz. 6 soruda takviye ihtiyacini ogren.
        </p>
      </div>

      <QuizEngine
        config={{
          quizId: 'nutrition',
          title: 'Beslenme Analizi',
          subtitle: '6 soruda eksiklik riskin',
          steps: STEPS,
          onComplete: (answers) => {
            const res = analyzeNutrition(answers);
            setResult(res);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        }}
      />
    </div>
  );
}
