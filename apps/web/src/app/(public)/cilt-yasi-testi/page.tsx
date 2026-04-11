'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';

// === Quiz Steps ===

const STEPS: QuizStep[] = [
  {
    id: 'age',
    question: 'Kronolojik yasin kac?',
    description: 'Gercek yasin — cilt yasini bununla karsilastiracagiz.',
    type: 'slider',
    sliderMin: 18,
    sliderMax: 65,
    sliderStep: 1,
  },
  {
    id: 'water',
    question: 'Gunluk su tuketimin nasil?',
    type: 'single',
    options: [
      { value: '1-2', label: '1-2 bardak', description: 'Gunde cok az su iciyorum', icon: 'water_drop' },
      { value: '3-5', label: '3-5 bardak', description: 'Orta seviye', icon: 'water_drop' },
      { value: '6-8', label: '6-8 bardak', description: 'Iyi seviye', icon: 'local_drink' },
      { value: '8+', label: '8+ bardak', description: 'Cok iyi hidrasyon', icon: 'local_drink' },
    ],
  },
  {
    id: 'sunscreen',
    question: 'Gunes kremi kullanir misin?',
    description: 'Gunes hasari cildin 1 numarali yaslandirici faktoru.',
    type: 'single',
    options: [
      { value: 'never', label: 'Hic kullanmam', icon: 'close' },
      { value: 'sometimes', label: 'Bazen — sadece yaz aylarinda', icon: 'wb_sunny' },
      { value: 'daily', label: 'Her gun kullanirim', icon: 'verified' },
    ],
  },
  {
    id: 'smoking',
    question: 'Sigara kullanimi?',
    description: 'Sigara kollajen yikimini hizlandirir.',
    type: 'single',
    options: [
      { value: 'never', label: 'Hic icmedim', icon: 'smoke_free' },
      { value: 'quit', label: 'Biraktim', icon: 'check_circle' },
      { value: 'occasional', label: 'Ara sira', icon: 'smoking_rooms' },
      { value: 'daily', label: 'Her gun', icon: 'smoking_rooms' },
    ],
  },
  {
    id: 'sleep',
    question: 'Ortalama uyku suren?',
    description: 'Uyku sirasinda cilt kendini onarir.',
    type: 'single',
    options: [
      { value: '4-5', label: '4-5 saat', description: 'Yetersiz uyku', icon: 'bedtime_off' },
      { value: '6-7', label: '6-7 saat', description: 'Orta seviye', icon: 'bedtime' },
      { value: '8+', label: '8+ saat', description: 'Ideal uyku', icon: 'nights_stay' },
    ],
  },
  {
    id: 'stress',
    question: 'Stres seviyen nasil?',
    description: 'Kronik stres kortizol artisina ve cilt yaslanmasina yol acar.',
    type: 'single',
    options: [
      { value: 'low', label: 'Dusuk', description: 'Genellikle rahat ve huzurluyum', icon: 'sentiment_satisfied' },
      { value: 'moderate', label: 'Orta', description: 'Zaman zaman stresli gunler', icon: 'sentiment_neutral' },
      { value: 'high', label: 'Yuksek', description: 'Cogu gun stres altindayim', icon: 'sentiment_dissatisfied' },
      { value: 'very_high', label: 'Cok yuksek', description: 'Surekli baski ve gerginlik', icon: 'sentiment_very_dissatisfied' },
    ],
  },
  {
    id: 'routine',
    question: 'Cilt bakim rutinin var mi?',
    type: 'single',
    options: [
      { value: 'none', label: 'Yok', description: 'Su ile yikamakla yetiniyorum', icon: 'close' },
      { value: 'basic', label: 'Basit', description: 'Temizleyici + nemlendirici', icon: 'check' },
      { value: 'detailed', label: 'Detayli', description: 'Serum, tonik, SPF, aktifler...', icon: 'auto_awesome' },
    ],
  },
];

// === Scoring Algorithm ===

function calculateSkinAge(answers: QuizAnswers): {
  chronologicalAge: number;
  skinAge: number;
  diff: number;
  strengths: { label: string; detail: string }[];
  improvements: { label: string; detail: string }[];
  message: string;
} {
  const age = (answers.age as number) || 30;
  let modifier = 0;

  const strengths: { label: string; detail: string }[] = [];
  const improvements: { label: string; detail: string }[] = [];

  // Sunscreen: biggest factor
  if (answers.sunscreen === 'daily') {
    modifier -= 3;
    strengths.push({ label: 'Duzenly gunes kremi', detail: 'Fotoyaslanmaya karsi en guclu koruma.' });
  } else if (answers.sunscreen === 'never') {
    modifier += 4;
    improvements.push({ label: 'Gunes kremi kullan', detail: 'UV hasari cildin 1 numarali yaslandirici faktorudur. Her gun SPF50 kullan.' });
  } else {
    modifier += 1;
    improvements.push({ label: 'Gunes kremini her gun kullan', detail: 'Sadece yazin degil, kis aylarinda da UVA isinlari cildi yaslandirir.' });
  }

  // Smoking
  if (answers.smoking === 'daily') {
    modifier += 5;
    improvements.push({ label: 'Sigarayi birak', detail: 'Sigara kollajen sentezini engeller ve cildi 10 yila kadar yaslandirir.' });
  } else if (answers.smoking === 'occasional') {
    modifier += 2;
    improvements.push({ label: 'Sigarayi tamamen birak', detail: 'Ara sira bile olsa sigara oksidatif stresi artirir.' });
  } else if (answers.smoking === 'quit') {
    modifier -= 1;
    strengths.push({ label: 'Sigarayi birakmissin', detail: 'Biraktiktan sonra cilt yenilenmesi baslar.' });
  } else {
    strengths.push({ label: 'Sigara icmiyorsun', detail: 'Bu buyuk bir avantaj — kollajen yapini koruyorsun.' });
  }

  // Sleep
  if (answers.sleep === '8+') {
    modifier -= 2;
    strengths.push({ label: 'Yeterli uyku', detail: 'Gece boyunca cilt onarimi optimal calisiyor.' });
  } else if (answers.sleep === '4-5') {
    modifier += 3;
    improvements.push({ label: 'Uyku suresini artir', detail: 'Yetersiz uyku koyu halkalar, solgun ten ve erken kirisilikliga yol acar.' });
  } else {
    modifier += 1;
  }

  // Water
  if (answers.water === '8+') {
    modifier -= 1;
    strengths.push({ label: 'Iyi hidrasyon', detail: 'Yeterli su tuketimi cilt elastikiyetini destekler.' });
  } else if (answers.water === '1-2') {
    modifier += 2;
    improvements.push({ label: 'Daha cok su ic', detail: 'Dehidrasyon cildi mat ve cansiz gosterir. Gunluk 2 litre hedefle.' });
  }

  // Stress
  if (answers.stress === 'low') {
    modifier -= 1;
    strengths.push({ label: 'Dusuk stres', detail: 'Stres hormonu kortizol kontrol altinda — cildin icin harika.' });
  } else if (answers.stress === 'very_high') {
    modifier += 3;
    improvements.push({ label: 'Stresi yonet', detail: 'Kronik stres cildi yaslandirir. Meditasyon, egzersiz veya nefes teknikleri dene.' });
  } else if (answers.stress === 'high') {
    modifier += 2;
    improvements.push({ label: 'Stres seviyeni dusur', detail: 'Yuksek stres inflamasyonu tetikler ve kollajen yikimini hizlandirir.' });
  }

  // Routine
  if (answers.routine === 'detailed') {
    modifier -= 2;
    strengths.push({ label: 'Detayli bakim rutini', detail: 'Aktif icerikler ve duzenli bakim fark yaratiyor.' });
  } else if (answers.routine === 'none') {
    modifier += 2;
    improvements.push({ label: 'Bakim rutini olustur', detail: 'En azindan temizleyici + nemlendirici + SPF ile basla.' });
  }

  const skinAge = Math.max(16, Math.min(80, age + modifier));
  const diff = age - skinAge;

  let message: string;
  if (diff >= 4) {
    message = 'Tebrikler! Cildin yasindan genc. Bunu boyle surdurelim.';
  } else if (diff >= 1) {
    message = 'Guzel gidiyorsun! Cildin yasindan biraz genc gorunuyor.';
  } else if (diff >= -1) {
    message = 'Cildin yasinla uyumlu. Birkac iyilestirmeyle daha da genclestirmek mumkun.';
  } else if (diff >= -4) {
    message = 'Cildin yasindan biraz yasli gorunuyor. Ama dogru bakimla her sey duzelir!';
  } else {
    message = 'Panik yok! Dogru bakimla her sey duzelir. Iste plan:';
  }

  return { chronologicalAge: age, skinAge, diff, strengths, improvements, message };
}

// === Page Component ===

export default function SkinAgeTestPage() {
  const [result, setResult] = useState<ReturnType<typeof calculateSkinAge> | null>(null);

  if (result) {
    const isYounger = result.diff > 0;
    const diffAbs = Math.abs(result.diff);

    const resultData: QuizResultData = {
      headline: `Tahmini Cilt Yasin: ${result.skinAge}`,
      subheadline: result.message,
      gauge: {
        value: result.skinAge,
        label: isYounger
          ? `Cildin yasindan ${diffAbs} yas genc!`
          : diffAbs === 0
            ? 'Cildin yasinla ayni'
            : `Cildin yasindan ${diffAbs} yas yasli`,
        color: isYounger ? '#4caf50' : diffAbs <= 2 ? '#ff9800' : '#f44336',
      },
      sections: [
        ...(result.strengths.length > 0 ? [{
          title: 'Guclu Yonlerin',
          icon: 'check_circle',
          items: result.strengths.map((s) => ({
            label: s.label,
            detail: s.detail,
            type: 'positive' as const,
          })),
        }] : []),
        ...(result.improvements.length > 0 ? [{
          title: 'Iyilestirme Alanlari',
          icon: 'tips_and_updates',
          items: result.improvements.map((s) => ({
            label: s.label,
            detail: s.detail,
            type: 'negative' as const,
          })),
        }] : []),
      ],
      cta: { label: 'Kisisel Onerileri Gor', href: '/cilt-analizi' },
      secondaryCta: { label: 'Tekrar Dene', href: '/cilt-yasi-testi' },
      shareText: `REVELA Cilt Yasi Testi: Yaşım ${result.chronologicalAge}, cilt yaşım ${result.skinAge}! ${isYounger ? `Cildim ${diffAbs} yaş genç 🎉` : ''}`,
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Cilt Yasi Testi</span>
        </nav>
        <QuizResult data={resultData} />
      </div>
    );
  }

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">Cilt Yasi Testi</span>
      </nav>

      {/* Intro */}
      <div className="text-center mb-12">
        <p className="label-caps text-outline mb-3 tracking-[0.4em]">Eglenceli Test</p>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
          CİLT YAŞI TESTİ
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Ayna yalan soyler, biz soylemeyiz. 7 soruda cildinin gercek yasini ogren.
        </p>
      </div>

      <QuizEngine
        config={{
          quizId: 'skin-age',
          title: 'Cilt Yasi Testi',
          subtitle: '7 soruda cilt yasini ogren',
          steps: STEPS,
          onComplete: (answers) => {
            const res = calculateSkinAge(answers);
            setResult(res);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        }}
      />
    </div>
  );
}
