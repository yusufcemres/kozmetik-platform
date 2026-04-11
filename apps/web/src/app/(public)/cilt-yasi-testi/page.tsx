'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuizEngine, { QuizAnswers, QuizStep } from '@/components/quiz/QuizEngine';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';

// === Quiz Steps ===

const STEPS: QuizStep[] = [
  {
    id: 'age',
    question: 'Kronolojik yaşın kaç?',
    description: 'Gerçek yaşın — cilt yaşını bununla karşılaştıracağız.',
    type: 'slider',
    sliderMin: 18,
    sliderMax: 65,
    sliderStep: 1,
  },
  {
    id: 'water',
    question: 'Günlük su tüketimin nasıl?',
    type: 'single',
    options: [
      { value: '1-2', label: '1-2 bardak', description: 'Günde çok az su içiyorum', icon: 'water_drop' },
      { value: '3-5', label: '3-5 bardak', description: 'Orta seviye', icon: 'water_drop' },
      { value: '6-8', label: '6-8 bardak', description: 'İyi seviye', icon: 'local_drink' },
      { value: '8+', label: '8+ bardak', description: 'Çok iyi hidrasyon', icon: 'local_drink' },
    ],
  },
  {
    id: 'sunscreen',
    question: 'Güneş kremi kullanır mısın?',
    description: 'Güneş hasarı cildin 1 numaralı yaşlandırıcı faktörü.',
    type: 'single',
    options: [
      { value: 'never', label: 'Hiç kullanmam', icon: 'close' },
      { value: 'sometimes', label: 'Bazen — sadece yaz aylarında', icon: 'wb_sunny' },
      { value: 'daily', label: 'Her gün kullanırım', icon: 'verified' },
    ],
  },
  {
    id: 'smoking',
    question: 'Sigara kullanımı?',
    description: 'Sigara kollajen yıkımını hızlandırır.',
    type: 'single',
    options: [
      { value: 'never', label: 'Hiç içmedim', icon: 'smoke_free' },
      { value: 'quit', label: 'Bıraktım', icon: 'check_circle' },
      { value: 'occasional', label: 'Ara sıra', icon: 'smoking_rooms' },
      { value: 'daily', label: 'Her gün', icon: 'smoking_rooms' },
    ],
  },
  {
    id: 'sleep',
    question: 'Ortalama uyku süren?',
    description: 'Uyku sırasında cilt kendini onarır.',
    type: 'single',
    options: [
      { value: '4-5', label: '4-5 saat', description: 'Yetersiz uyku', icon: 'bedtime_off' },
      { value: '6-7', label: '6-7 saat', description: 'Orta seviye', icon: 'bedtime' },
      { value: '8+', label: '8+ saat', description: 'İdeal uyku', icon: 'nights_stay' },
    ],
  },
  {
    id: 'stress',
    question: 'Stres seviyen nasıl?',
    description: 'Kronik stres kortizol artışına ve cilt yaşlanmasına yol açar.',
    type: 'single',
    options: [
      { value: 'low', label: 'Düşük', description: 'Genellikle rahat ve huzurluyum', icon: 'sentiment_satisfied' },
      { value: 'moderate', label: 'Orta', description: 'Zaman zaman stresli günler', icon: 'sentiment_neutral' },
      { value: 'high', label: 'Yüksek', description: 'Çoğu gün stres altındayım', icon: 'sentiment_dissatisfied' },
      { value: 'very_high', label: 'Çok yüksek', description: 'Sürekli baskı ve gerginlik', icon: 'sentiment_very_dissatisfied' },
    ],
  },
  {
    id: 'routine',
    question: 'Cilt bakım rutinin var mı?',
    type: 'single',
    options: [
      { value: 'none', label: 'Yok', description: 'Su ile yıkamakla yetiniyorum', icon: 'close' },
      { value: 'basic', label: 'Basit', description: 'Temizleyici + nemlendirici', icon: 'check' },
      { value: 'detailed', label: 'Detaylı', description: 'Serum, tonik, SPF, aktifler...', icon: 'auto_awesome' },
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
    strengths.push({ label: 'Düzenli güneş kremi', detail: 'Fotoyaşlanmaya karşı en güçlü koruma.' });
  } else if (answers.sunscreen === 'never') {
    modifier += 4;
    improvements.push({ label: 'Güneş kremi kullan', detail: 'UV hasarı cildin 1 numaralı yaşlandırıcı faktörüdür. Her gün SPF50 kullan.' });
  } else {
    modifier += 1;
    improvements.push({ label: 'Güneş kremini her gün kullan', detail: 'Sadece yazın değil, kış aylarında da UVA ışınları cildi yaşlandırır.' });
  }

  // Smoking
  if (answers.smoking === 'daily') {
    modifier += 5;
    improvements.push({ label: 'Sigarayı bırak', detail: 'Sigara kollajen sentezini engeller ve cildi 10 yıla kadar yaşlandırır.' });
  } else if (answers.smoking === 'occasional') {
    modifier += 2;
    improvements.push({ label: 'Sigarayı tamamen bırak', detail: 'Ara sıra bile olsa sigara oksidatif stresi artırır.' });
  } else if (answers.smoking === 'quit') {
    modifier -= 1;
    strengths.push({ label: 'Sigarayı bırakmışsın', detail: 'Bıraktıktan sonra cilt yenilenmesi başlar.' });
  } else {
    strengths.push({ label: 'Sigara içmiyorsun', detail: 'Bu büyük bir avantaj — kollajen yapını koruyorsun.' });
  }

  // Sleep
  if (answers.sleep === '8+') {
    modifier -= 2;
    strengths.push({ label: 'Yeterli uyku', detail: 'Gece boyunca cilt onarımı optimal çalışıyor.' });
  } else if (answers.sleep === '4-5') {
    modifier += 3;
    improvements.push({ label: 'Uyku süresini artır', detail: 'Yetersiz uyku koyu halkalar, solgun ten ve erken kırışıklığa yol açar.' });
  } else {
    modifier += 1;
  }

  // Water
  if (answers.water === '8+') {
    modifier -= 1;
    strengths.push({ label: 'İyi hidrasyon', detail: 'Yeterli su tüketimi cilt elastikiyetini destekler.' });
  } else if (answers.water === '1-2') {
    modifier += 2;
    improvements.push({ label: 'Daha çok su iç', detail: 'Dehidrasyon cildi mat ve cansız gösterir. Günlük 2 litre hedefle.' });
  }

  // Stress
  if (answers.stress === 'low') {
    modifier -= 1;
    strengths.push({ label: 'Düşük stres', detail: 'Stres hormonu kortizol kontrol altında — cildin için harika.' });
  } else if (answers.stress === 'very_high') {
    modifier += 3;
    improvements.push({ label: 'Stresi yönet', detail: 'Kronik stres cildi yaşlandırır. Meditasyon, egzersiz veya nefes teknikleri dene.' });
  } else if (answers.stress === 'high') {
    modifier += 2;
    improvements.push({ label: 'Stres seviyeni düşür', detail: 'Yüksek stres inflamasyonu tetikler ve kollajen yıkımını hızlandırır.' });
  }

  // Routine
  if (answers.routine === 'detailed') {
    modifier -= 2;
    strengths.push({ label: 'Detaylı bakım rutini', detail: 'Aktif içerikler ve düzenli bakım fark yaratıyor.' });
  } else if (answers.routine === 'none') {
    modifier += 2;
    improvements.push({ label: 'Bakım rutini oluştur', detail: 'En azından temizleyici + nemlendirici + SPF ile başla.' });
  }

  const skinAge = Math.max(16, Math.min(80, age + modifier));
  const diff = age - skinAge;

  let message: string;
  if (diff >= 4) {
    message = 'Tebrikler! Cildin yaşından genç. Bunu böyle sürdürelim.';
  } else if (diff >= 1) {
    message = 'Güzel gidiyorsun! Cildin yaşından biraz genç görünüyor.';
  } else if (diff >= -1) {
    message = 'Cildin yaşınla uyumlu. Birkaç iyileştirmeyle daha da gençleştirmek mümkün.';
  } else if (diff >= -4) {
    message = 'Cildin yaşından biraz yaşlı görünüyor. Ama doğru bakımla her şey düzelir!';
  } else {
    message = 'Panik yok! Doğru bakımla her şey düzelir. İşte plan:';
  }

  return { chronologicalAge: age, skinAge, diff, strengths, improvements, message };
}

// === Page Component ===

const QUICK_STEP_IDS = ['age', 'sunscreen', 'sleep'];

export default function SkinAgeTestPage() {
  const [mode, setMode] = useState<'intro' | 'quick' | 'detailed'>('intro');
  const [result, setResult] = useState<ReturnType<typeof calculateSkinAge> | null>(null);

  const activeSteps = mode === 'quick' ? STEPS.filter(s => QUICK_STEP_IDS.includes(s.id)) : STEPS;

  if (result) {
    const isYounger = result.diff > 0;
    const diffAbs = Math.abs(result.diff);

    const resultData: QuizResultData = {
      headline: `Tahmini Cilt Yaşın: ${result.skinAge}`,
      subheadline: result.message,
      gauge: {
        value: result.skinAge,
        label: isYounger
          ? `Cildin yaşından ${diffAbs} yaş genç!`
          : diffAbs === 0
            ? 'Cildin yaşınla aynı'
            : `Cildin yaşından ${diffAbs} yaş yaşlı`,
        color: isYounger ? '#4caf50' : diffAbs <= 2 ? '#ff9800' : '#f44336',
      },
      sections: [
        ...(result.strengths.length > 0 ? [{
          title: 'Güçlü Yönlerin',
          icon: 'check_circle',
          items: result.strengths.map((s) => ({
            label: s.label,
            detail: s.detail,
            type: 'positive' as const,
          })),
        }] : []),
        ...(result.improvements.length > 0 ? [{
          title: 'İyileştirme Alanları',
          icon: 'tips_and_updates',
          items: result.improvements.map((s) => ({
            label: s.label,
            detail: s.detail,
            type: 'negative' as const,
          })),
        }] : []),
      ],
      cta: { label: 'Kişisel Önerileri Gör', href: '/cilt-analizi' },
      secondaryCta: { label: 'Tekrar Dene', href: '/cilt-yasi-testi' },
      shareText: `REVELA Cilt Yaşı Testi: Yaşım ${result.chronologicalAge}, cilt yaşım ${result.skinAge}! ${isYounger ? `Cildim ${diffAbs} yaş genç 🎉` : ''}`,
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Cilt Yaşı Testi</span>
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
        <span className="text-on-surface font-medium">Cilt Yaşı Testi</span>
      </nav>

      {mode === 'intro' ? (
        <div className="max-w-2xl mx-auto text-center py-8">
          <span className="material-icon text-primary mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">timer</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-2">CİLT YAŞI TESTİ</h1>
          <p className="text-on-surface-variant text-sm mb-10">Ayna yalan söyler, biz söylemeyiz.</p>

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
              <p className="text-xs text-on-surface-variant mt-1">7 soru, ~3 dakika</p>
              <p className="text-xs text-outline mt-2">Daha doğru sonuçlar</p>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
            <p className="label-caps text-outline mb-3 tracking-[0.4em]">Eğlenceli Test</p>
            <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
              CİLT YAŞI TESTİ
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              {mode === 'quick' ? '3 soruda tahmini cilt yaşını öğren.' : '7 soruda cildinin gerçek yaşını öğren.'}
            </p>
          </div>

          <QuizEngine
            config={{
              quizId: 'skin-age',
              title: 'Cilt Yaşı Testi',
              subtitle: mode === 'quick' ? '3 soruda hızlı sonuç' : '7 soruda cilt yaşını öğren',
              steps: activeSteps,
              onComplete: (answers) => {
                const res = calculateSkinAge(answers);
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
