'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
}

interface QuizState {
  skin_type: string;
  skin_feel: string;
  pore_size: string;
  age_range: string;
  concerns: number[];
  concern_severity: Record<number, 'mild' | 'moderate' | 'severe'>;
  sensitivities: Record<string, boolean>;
  routine: { morning_steps: number; evening_steps: number; sunscreen: boolean; makeup: boolean };
  lifestyle: { sun_exposure: string; stress: string; sleep: string; water: string; diet: string; exercise: string };
  environment: { climate: string; pollution: string; indoor_heating: boolean };
  goals: string[];
  texture_preference: string[];
  fragrance_preference: string;
  budget: string;
}

const INITIAL: QuizState = {
  skin_type: '',
  skin_feel: '',
  pore_size: '',
  age_range: '',
  concerns: [],
  concern_severity: {},
  sensitivities: {},
  routine: { morning_steps: 0, evening_steps: 0, sunscreen: false, makeup: false },
  lifestyle: { sun_exposure: 'moderate', stress: 'moderate', sleep: 'good', water: 'moderate', diet: 'mixed', exercise: 'moderate' },
  environment: { climate: 'temperate', pollution: 'moderate', indoor_heating: false },
  goals: [],
  texture_preference: [],
  fragrance_preference: 'no_preference',
  budget: '',
};

// === Step Data ===

const skinTypes = [
  { value: 'oily', label: 'Yağlı', desc: 'Gün içinde parlama, geniş gözenekler', icon: 'water_drop' },
  { value: 'dry', label: 'Kuru', desc: 'Sıkılık hissi, pullanma, mat görünüm', icon: 'air' },
  { value: 'combination', label: 'Karma', desc: 'T-bölge yağlı, yanaklar normal/kuru', icon: 'contrast' },
  { value: 'normal', label: 'Normal', desc: 'Dengeli nem, az sorun', icon: 'check_circle' },
  { value: 'sensitive', label: 'Hassas', desc: 'Kızarıklık, tahriş, batma hissi', icon: 'warning_amber' },
];

const skinFeelOptions = [
  { value: 'tight', label: 'Gergin & Sıkı', desc: 'Yıkama sonrası çekme hissi', icon: 'compress' },
  { value: 'oily_midday', label: 'Öğlene Kadar Yağlanır', desc: 'Sabah temiz ama öğlende parlak', icon: 'schedule' },
  { value: 'flaky', label: 'Pullanma & Soyulma', desc: 'Kuru bölgelerde pul pul dökülme', icon: 'grain' },
  { value: 'comfortable', label: 'Rahat & Dengeli', desc: 'Gün boyunca konforlu hissettiriyor', icon: 'sentiment_satisfied' },
  { value: 'reactive', label: 'Reaktif & Kızarık', desc: 'Ürünlere veya hava değişimine tepki verir', icon: 'local_fire_department' },
];

const poreSizeOptions = [
  { value: 'small', label: 'Küçük / Görünmez', desc: 'Gözenekler zor fark edilir' },
  { value: 'medium', label: 'Orta', desc: 'Burun ve yanakta fark edilir' },
  { value: 'large', label: 'Büyük / Belirgin', desc: 'T-bölgede geniş gözenekler' },
  { value: 'mixed', label: 'Karma', desc: 'Bölgeye göre değişen gözenek boyutu' },
];

const ageRanges = [
  { value: '18-24', label: '18–24', desc: 'Genç cilt — sivilce kontrolü, temel koruma' },
  { value: '25-34', label: '25–34', desc: 'Önleme dönemi — antioksidan, nem bariyeri' },
  { value: '35-44', label: '35–44', desc: 'İlk belirtiler — anti-aging, pigmentasyon' },
  { value: '45-54', label: '45–54', desc: 'Aktif onarım — retinol, peptit, sıkılaştırma' },
  { value: '55+', label: '55+', desc: 'Yoğun beslenme — barriyer güçlendirme, hacim' },
];

const sensitivities = [
  { key: 'fragrance', label: 'Parfüm / Koku', icon: 'spa', desc: 'Kokulu ürünlere kızarıklık veya kaşıntı' },
  { key: 'alcohol', label: 'Alkol', icon: 'science', desc: 'Alkol bazlı ürünlerde yanma, kurukluk' },
  { key: 'paraben', label: 'Paraben', icon: 'block', desc: 'Paraben koruyuculara reaksiyon' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar', icon: 'eco', desc: 'Tea tree, lavanta gibi yağlara alerji' },
  { key: 'retinol', label: 'Retinol / Retinoid', icon: 'brightness_high', desc: 'Retinol ile pullanma, tahriş' },
  { key: 'aha_bha', label: 'AHA / BHA Asitler', icon: 'science', desc: 'Glikolik, salisilik aside tepki' },
];

const goalOptions = [
  { value: 'anti_aging', label: 'Yaşlanma Karşıtı', icon: 'hourglass_empty' },
  { value: 'brightening', label: 'Aydınlatma & Leke Giderme', icon: 'light_mode' },
  { value: 'hydration', label: 'Yoğun Nemlendirme', icon: 'water_drop' },
  { value: 'acne_control', label: 'Sivilce & Akne Kontrolü', icon: 'healing' },
  { value: 'pore_minimize', label: 'Gözenek Sıkılaştırma', icon: 'blur_on' },
  { value: 'barrier_repair', label: 'Bariyer Onarımı', icon: 'shield' },
  { value: 'even_tone', label: 'Ton Eşitleme', icon: 'palette' },
  { value: 'firmness', label: 'Sıkılaştırma & Elastikiyet', icon: 'fitness_center' },
];

const textureOptions = [
  { value: 'lightweight', label: 'Hafif / Jel', icon: 'opacity' },
  { value: 'cream', label: 'Krem / Zengin', icon: 'spa' },
  { value: 'serum', label: 'Serum / Su Bazlı', icon: 'science' },
  { value: 'oil', label: 'Yağ Bazlı', icon: 'local_florist' },
  { value: 'no_preference', label: 'Fark Etmez', icon: 'check' },
];

const environmentOptions = {
  climate: [
    { value: 'hot_humid', label: 'Sıcak & Nemli' },
    { value: 'hot_dry', label: 'Sıcak & Kuru' },
    { value: 'temperate', label: 'Ilıman' },
    { value: 'cold_dry', label: 'Soğuk & Kuru' },
    { value: 'variable', label: 'Değişken / Mevsimsel' },
  ],
  pollution: [
    { value: 'low', label: 'Az (kırsal/sakin)' },
    { value: 'moderate', label: 'Orta' },
    { value: 'high', label: 'Yüksek (büyükşehir)' },
  ],
};

const budgetOptions = [
  { value: 'budget', label: 'Uygun Fiyatlı', desc: 'Ürün başı ₺200 altı', icon: 'savings' },
  { value: 'mid', label: 'Orta Segment', desc: '₺200 – ₺500', icon: 'account_balance_wallet' },
  { value: 'premium', label: 'Premium', desc: '₺500 ve üzeri', icon: 'diamond' },
];

const TOTAL_STEPS = 10;

// === Page ===

export default function SkinAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>(INITIAL);
  const [needs, setNeeds] = useState<Need[]>([]);

  useEffect(() => {
    api.get<{ data: Need[] }>('/needs?limit=50')
      .then((res) => setNeeds((res.data || []).filter(n => n.need_group !== 'supplement')))
      .catch(() => {});

    try {
      const stored = localStorage.getItem('skin_profile');
      if (stored) {
        const p = JSON.parse(stored);
        setQuiz((prev) => ({
          ...prev,
          skin_type: p.skin_type || '',
          concerns: p.concerns || [],
          sensitivities: p.sensitivities || {},
          age_range: p.age_range || '',
          budget: p.budget || '',
        }));
      }
    } catch {}
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return !!quiz.skin_type;
      case 2: return !!quiz.skin_feel;
      case 3: return !!quiz.age_range;
      case 4: return quiz.concerns.length > 0;
      case 5: return quiz.concerns.length > 0; // severity step — auto-filled defaults
      case 6: return true; // sensitivities optional
      case 7: return true; // routine
      case 8: return true; // lifestyle + environment
      case 9: return quiz.goals.length > 0;
      case 10: return !!quiz.budget;
      default: return false;
    }
  };

  const handleFinish = () => {
    const profile = {
      anonymous_id: crypto.randomUUID(),
      ...quiz,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('skin_profile', JSON.stringify(profile));

    const sensitivityKeys = Object.entries(quiz.sensitivities)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');

    const params = new URLSearchParams({
      skin_type: quiz.skin_type,
      skin_feel: quiz.skin_feel,
      pore_size: quiz.pore_size,
      age_range: quiz.age_range,
      concerns: quiz.concerns.join(','),
      severity: JSON.stringify(quiz.concern_severity),
      sensitivities: sensitivityKeys,
      budget: quiz.budget,
      goals: quiz.goals.join(','),
      texture: quiz.texture_preference.join(','),
      fragrance: quiz.fragrance_preference,
      climate: quiz.environment.climate,
      pollution: quiz.environment.pollution,
      sun: quiz.lifestyle.sun_exposure,
      stress: quiz.lifestyle.stress,
      sleep: quiz.lifestyle.sleep,
      water: quiz.lifestyle.water,
    });
    router.push(`/cilt-analizi/sonuc?${params.toString()}`);
  };

  const toggleConcern = (id: number) => {
    setQuiz((prev) => {
      const has = prev.concerns.includes(id);
      const newConcerns = has
        ? prev.concerns.filter((c) => c !== id)
        : prev.concerns.length < 5 ? [...prev.concerns, id] : prev.concerns;
      const newSeverity = { ...prev.concern_severity };
      if (!has && !newSeverity[id]) newSeverity[id] = 'moderate';
      if (has) delete newSeverity[id];
      return { ...prev, concerns: newConcerns, concern_severity: newSeverity };
    });
  };

  const toggleGoal = (val: string) => {
    setQuiz((prev) => ({
      ...prev,
      goals: prev.goals.includes(val)
        ? prev.goals.filter((g) => g !== val)
        : prev.goals.length < 3 ? [...prev.goals, val] : prev.goals,
    }));
  };

  const toggleTexture = (val: string) => {
    setQuiz((prev) => ({
      ...prev,
      texture_preference: prev.texture_preference.includes(val)
        ? prev.texture_preference.filter((t) => t !== val)
        : [...prev.texture_preference, val],
    }));
  };

  const stepTitles = [
    'Cilt Tipi', 'Cilt Hissi', 'Yaş', 'İhtiyaçlar', 'Şiddet',
    'Hassasiyet', 'Rutin', 'Yaşam Tarzı', 'Hedefler', 'Bütçe',
  ];

  return (
    <div className="curator-section max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
          <span className="material-icon material-icon-sm" aria-hidden="true">auto_awesome</span>
          Derinlemesine Analiz
        </div>
        <h1 className="text-3xl headline-tight text-on-surface">CİLT ANALİZİ</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          10 adımda cildini detaylı tanı, bilimsel öneri al.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps text-outline">{stepTitles[step - 1]} — {step}/{TOTAL_STEPS}</span>
          <span className="label-caps text-primary">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Skin Type */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cilt tipin ne?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Genel cilt tipini seç — emin değilsen en yakın olanı işaretle.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setQuiz((p) => ({ ...p, skin_type: type.value }))}
                className={`curator-card p-5 text-left transition-all flex items-start gap-4 ${
                  quiz.skin_type === type.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon mt-0.5 ${quiz.skin_type === type.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {type.icon}
                </span>
                <div>
                  <span className="font-semibold text-on-surface text-base">{type.label}</span>
                  <span className="block text-xs text-on-surface-variant mt-1">{type.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Skin Feel — deeper diagnostic */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cildin gün içinde nasıl hissettiriyor?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Bu bilgi cilt tipi doğrulaması ve ürün doku önerisi için kullanılır.</p>
          <div className="grid grid-cols-1 gap-3">
            {skinFeelOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuiz((p) => ({ ...p, skin_feel: opt.value }))}
                className={`curator-card p-5 text-left transition-all flex items-start gap-4 ${
                  quiz.skin_feel === opt.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon mt-0.5 ${quiz.skin_feel === opt.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {opt.icon}
                </span>
                <div>
                  <span className="font-semibold text-on-surface">{opt.label}</span>
                  <span className="block text-xs text-on-surface-variant mt-1">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Pore size — sub-question */}
          <div className="mt-6">
            <p className="text-sm font-medium text-on-surface mb-3">Gözenek boyutun nasıl?</p>
            <div className="grid grid-cols-2 gap-2">
              {poreSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuiz((p) => ({ ...p, pore_size: opt.value }))}
                  className={`curator-card p-3 text-center text-xs transition-all ${
                    quiz.pore_size === opt.value ? 'border-primary ring-1 ring-primary bg-primary/5 font-semibold text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Age */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaş aralığın?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Yaşa göre farklı aktif maddeler öne çıkar.</p>
          <div className="grid grid-cols-1 gap-3">
            {ageRanges.map((age) => (
              <button
                key={age.value}
                onClick={() => setQuiz((p) => ({ ...p, age_range: age.value }))}
                className={`curator-card p-5 text-left transition-all flex items-center gap-4 ${
                  quiz.age_range === age.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className="text-2xl font-bold text-on-surface w-16 shrink-0">{age.label}</span>
                <span className="text-xs text-on-surface-variant">{age.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Concerns */}
      {step === 4 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cilt ihtiyaçların neler?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">En fazla 5 ihtiyaç seçebilirsin. ({quiz.concerns.length}/5)</p>
          <div className="grid grid-cols-2 gap-3">
            {needs.map((need) => (
              <button
                key={need.need_id}
                onClick={() => toggleConcern(need.need_id)}
                className={`curator-card p-4 text-left text-sm transition-all ${
                  quiz.concerns.includes(need.need_id)
                    ? 'border-primary ring-1 ring-primary bg-primary/5 font-semibold text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon material-icon-sm mr-1.5 align-text-bottom ${quiz.concerns.includes(need.need_id) ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {quiz.concerns.includes(need.need_id) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {need.need_name}
                {need.short_description && (
                  <span className="block text-[10px] text-on-surface-variant mt-1 ml-6">{need.short_description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Concern Severity */}
      {step === 5 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">İhtiyaçlarının şiddeti ne seviyede?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Her ihtiyaç için şiddet belirle — daha doğru ürün önerisi için.</p>
          <div className="space-y-3">
            {quiz.concerns.map((id) => {
              const need = needs.find((n) => n.need_id === id);
              if (!need) return null;
              const severity = quiz.concern_severity[id] || 'moderate';
              return (
                <div key={id} className="curator-card p-5">
                  <p className="font-semibold text-on-surface mb-3">{need.need_name}</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'mild' as const, label: 'Hafif', color: 'bg-score-high text-on-primary' },
                      { value: 'moderate' as const, label: 'Orta', color: 'bg-score-medium text-on-primary' },
                      { value: 'severe' as const, label: 'Şiddetli', color: 'bg-score-low text-on-primary' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuiz((p) => ({
                          ...p,
                          concern_severity: { ...p.concern_severity, [id]: opt.value },
                        }))}
                        className={`flex-1 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                          severity === opt.value
                            ? opt.color
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 6: Sensitivities */}
      {step === 6 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Hassasiyetlerin var mı?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Bilinen hassasiyetlerin varsa işaretle, yoksa atla.</p>
          <div className="grid grid-cols-2 gap-3">
            {sensitivities.map((s) => (
              <button
                key={s.key}
                onClick={() => setQuiz((p) => ({
                  ...p,
                  sensitivities: { ...p.sensitivities, [s.key]: !p.sensitivities[s.key] },
                }))}
                className={`curator-card p-4 text-center transition-all flex flex-col items-center gap-2 ${
                  quiz.sensitivities[s.key] ? 'border-error ring-1 ring-error bg-error/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon ${quiz.sensitivities[s.key] ? 'text-error' : 'text-outline-variant'}`} aria-hidden="true">
                  {s.icon}
                </span>
                <span className={`text-sm ${quiz.sensitivities[s.key] ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                  {s.label}
                </span>
                <span className="text-[10px] text-outline">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 7: Routine */}
      {step === 7 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Günlük bakım rutinin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Mevcut rutinin başlangıç noktamız.</p>
          <div className="space-y-4">
            <div className="curator-card p-5">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">light_mode</span>
                Sabah kaç adım uyguluyorsun?
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuiz((p) => ({ ...p, routine: { ...p.routine, morning_steps: n } }))}
                    className={`flex-1 py-2 rounded-sm text-sm font-medium transition-colors ${
                      quiz.routine.morning_steps === n ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {n === 0 ? 'Yok' : n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            </div>
            <div className="curator-card p-5">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-primary" aria-hidden="true">dark_mode</span>
                Akşam kaç adım uyguluyorsun?
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuiz((p) => ({ ...p, routine: { ...p.routine, evening_steps: n } }))}
                    className={`flex-1 py-2 rounded-sm text-sm font-medium transition-colors ${
                      quiz.routine.evening_steps === n ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {n === 0 ? 'Yok' : n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuiz((p) => ({ ...p, routine: { ...p.routine, sunscreen: !p.routine.sunscreen } }))}
                className={`curator-card p-4 text-center text-sm transition-all ${
                  quiz.routine.sunscreen ? 'border-score-high ring-1 ring-score-high bg-score-high/5' : ''
                }`}
              >
                <span className={`material-icon block mb-1 ${quiz.routine.sunscreen ? 'text-score-high' : 'text-outline-variant'}`} aria-hidden="true">wb_sunny</span>
                Güneş kremi kullanıyorum
              </button>
              <button
                onClick={() => setQuiz((p) => ({ ...p, routine: { ...p.routine, makeup: !p.routine.makeup } }))}
                className={`curator-card p-4 text-center text-sm transition-all ${
                  quiz.routine.makeup ? 'border-primary ring-1 ring-primary bg-primary/5' : ''
                }`}
              >
                <span className={`material-icon block mb-1 ${quiz.routine.makeup ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">face_retouching_natural</span>
                Düzenli makyaj yapıyorum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 8: Lifestyle + Environment */}
      {step === 8 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaşam tarzın & çevren</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Çevresel faktörler cilt sağlığını doğrudan etkiler.</p>
          <div className="space-y-4">
            {/* Climate */}
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">thermostat</span>
                Yaşadığın iklim
              </label>
              <div className="flex flex-wrap gap-2">
                {environmentOptions.climate.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuiz((p) => ({ ...p, environment: { ...p.environment, climate: opt.value } }))}
                    className={`px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                      quiz.environment.climate === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Pollution */}
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">factory</span>
                Hava kirliliği seviyesi
              </label>
              <div className="flex gap-2">
                {environmentOptions.pollution.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuiz((p) => ({ ...p, environment: { ...p.environment, pollution: opt.value } }))}
                    className={`flex-1 py-2 rounded-sm text-xs font-medium transition-colors ${
                      quiz.environment.pollution === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Lifestyle factors */}
            {[
              { key: 'sun_exposure', label: 'Güneşe maruz kalma', icon: 'wb_sunny', options: [
                { value: 'low', label: 'Az' }, { value: 'moderate', label: 'Orta' }, { value: 'high', label: 'Yüksek' },
              ]},
              { key: 'stress', label: 'Stres seviyesi', icon: 'psychology', options: [
                { value: 'low', label: 'Düşük' }, { value: 'moderate', label: 'Orta' }, { value: 'high', label: 'Yüksek' },
              ]},
              { key: 'sleep', label: 'Uyku kalitesi', icon: 'bedtime', options: [
                { value: 'poor', label: 'Kötü' }, { value: 'moderate', label: 'Orta' }, { value: 'good', label: 'İyi' },
              ]},
              { key: 'water', label: 'Günlük su tüketimi', icon: 'local_drink', options: [
                { value: 'low', label: '<1L' }, { value: 'moderate', label: '1-2L' }, { value: 'high', label: '2L+' },
              ]},
            ].map((item) => (
              <div key={item.key} className="curator-card p-4">
                <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                  <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </label>
                <div className="flex gap-2">
                  {item.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuiz((p) => ({
                        ...p,
                        lifestyle: { ...p.lifestyle, [item.key]: opt.value },
                      }))}
                      className={`flex-1 py-2 rounded-sm text-xs font-medium transition-colors ${
                        quiz.lifestyle[item.key as keyof typeof quiz.lifestyle] === opt.value
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 9: Goals + Texture + Fragrance */}
      {step === 9 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bakım hedeflerin & tercihlerin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">En fazla 3 hedef seç.</p>

          {/* Goals */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {goalOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleGoal(opt.value)}
                className={`curator-card p-4 text-center transition-all flex flex-col items-center gap-2 ${
                  quiz.goals.includes(opt.value) ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon ${quiz.goals.includes(opt.value) ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {opt.icon}
                </span>
                <span className={`text-xs ${quiz.goals.includes(opt.value) ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Texture preference */}
          <p className="text-sm font-medium text-on-surface mb-3">Tercih ettiğin ürün dokusu</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {textureOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleTexture(opt.value)}
                className={`px-3 py-2 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  quiz.texture_preference.includes(opt.value)
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-icon text-[16px]" aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Fragrance */}
          <p className="text-sm font-medium text-on-surface mb-3">Koku tercihin</p>
          <div className="flex gap-2">
            {[
              { value: 'fragrance_free', label: 'Kokusuz Tercih Ederim' },
              { value: 'light', label: 'Hafif Koku Olabilir' },
              { value: 'no_preference', label: 'Fark Etmez' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuiz((p) => ({ ...p, fragrance_preference: opt.value }))}
                className={`flex-1 py-2 rounded-sm text-xs font-medium transition-colors ${
                  quiz.fragrance_preference === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 10: Budget */}
      {step === 10 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bütçe tercihin?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Ürün başına harcama beklentin.</p>
          <div className="grid grid-cols-1 gap-3">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuiz((p) => ({ ...p, budget: opt.value }))}
                className={`curator-card p-5 text-left transition-all flex items-center gap-4 ${
                  quiz.budget === opt.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon text-2xl ${quiz.budget === opt.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {opt.icon}
                </span>
                <div>
                  <span className="font-semibold text-on-surface text-base">{opt.label}</span>
                  <span className="block text-xs text-on-surface-variant mt-0.5">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-10">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 curator-btn-outline py-3.5 text-xs"
          >
            <span className="material-icon material-icon-sm mr-1 align-text-bottom" aria-hidden="true">arrow_back</span>
            GERİ
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex-1 curator-btn-primary py-3.5 text-xs disabled:opacity-50"
          >
            DEVAM
            <span className="material-icon material-icon-sm ml-1 align-text-bottom" aria-hidden="true">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!canProceed()}
            className="flex-1 curator-btn-primary py-3.5 text-xs disabled:opacity-50"
          >
            <span className="material-icon material-icon-sm mr-1 align-text-bottom" aria-hidden="true">auto_awesome</span>
            SONUÇLARIMI GÖR
          </button>
        )}
      </div>
    </div>
  );
}
