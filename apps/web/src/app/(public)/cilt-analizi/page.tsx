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
}

interface QuizState {
  skin_type: string;
  age_range: string;
  concerns: number[];
  sensitivities: Record<string, boolean>;
  routine: { morning_steps: number; evening_steps: number; sunscreen: boolean; makeup: boolean };
  lifestyle: { sun_exposure: string; stress: string; sleep: string; water: string };
  budget: string;
}

const INITIAL: QuizState = {
  skin_type: '',
  age_range: '',
  concerns: [],
  sensitivities: {},
  routine: { morning_steps: 0, evening_steps: 0, sunscreen: false, makeup: false },
  lifestyle: { sun_exposure: 'moderate', stress: 'moderate', sleep: 'good', water: 'moderate' },
  budget: '',
};

// === Step Data ===

const skinTypes = [
  { value: 'oily', label: 'Yağlı', desc: 'Gün içinde parlama, geniş gözenekler', icon: 'water_drop', color: 'text-primary' },
  { value: 'dry', label: 'Kuru', desc: 'Sıkılık hissi, pullanma', icon: 'air', color: 'text-score-medium' },
  { value: 'combination', label: 'Karma', desc: 'T-bölge yağlı, yanaklar kuru', icon: 'contrast', color: 'text-on-surface' },
  { value: 'normal', label: 'Normal', desc: 'Dengeli nem, az sorun', icon: 'check_circle', color: 'text-score-high' },
  { value: 'sensitive', label: 'Hassas', desc: 'Kızarıklık, tahriş eğilimi', icon: 'warning_amber', color: 'text-error' },
];

const ageRanges = [
  { value: '18-24', label: '18-24', desc: 'Genç cilt, sivilce odaklı bakım' },
  { value: '25-34', label: '25-34', desc: 'Önleme ve koruma dönemi' },
  { value: '35-44', label: '35-44', desc: 'Anti-aging ve onarım' },
  { value: '45+', label: '45+', desc: 'Yoğun beslenme ve sıkılaştırma' },
];

const sensitivities = [
  { key: 'fragrance', label: 'Parfüm', icon: 'spa', desc: 'Kokulu ürünlere hassasiyet' },
  { key: 'alcohol', label: 'Alkol', icon: 'science', desc: 'Alkol bazlı ürünlere tepki' },
  { key: 'paraben', label: 'Paraben', icon: 'block', desc: 'Paraben koruyuculara hassasiyet' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar', icon: 'eco', desc: 'Bitkisel yağlara alerji' },
];

const budgetOptions = [
  { value: 'budget', label: 'Uygun', desc: 'Ürün başı ₺200 altı', icon: 'savings' },
  { value: 'mid', label: 'Orta', desc: '₺200 - ₺500 arası', icon: 'account_balance_wallet' },
  { value: 'premium', label: 'Premium', desc: '₺500 ve üzeri', icon: 'diamond' },
];

const TOTAL_STEPS = 7;

// === Page ===

export default function SkinAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>(INITIAL);
  const [needs, setNeeds] = useState<Need[]>([]);

  useEffect(() => {
    api.get<{ data: Need[] }>('/needs?limit=50')
      .then((res) => setNeeds(res.data || []))
      .catch(() => {});

    // Pre-fill from existing profile
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
      case 2: return !!quiz.age_range;
      case 3: return quiz.concerns.length > 0;
      case 4: return true; // sensitivities optional
      case 5: return true;
      case 6: return true;
      case 7: return !!quiz.budget;
      default: return false;
    }
  };

  const handleFinish = () => {
    // Save to localStorage
    const profile = {
      anonymous_id: crypto.randomUUID(),
      ...quiz,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('skin_profile', JSON.stringify(profile));

    // Navigate to results with query params
    const params = new URLSearchParams({
      skin_type: quiz.skin_type,
      age_range: quiz.age_range,
      concerns: quiz.concerns.join(','),
      sensitivities: Object.entries(quiz.sensitivities)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(','),
      budget: quiz.budget,
    });
    router.push(`/cilt-analizi/sonuc?${params.toString()}`);
  };

  const toggleConcern = (id: number) => {
    setQuiz((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(id)
        ? prev.concerns.filter((c) => c !== id)
        : prev.concerns.length < 3
          ? [...prev.concerns, id]
          : prev.concerns,
    }));
  };

  return (
    <div className="curator-section max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
          <span className="material-icon material-icon-sm" aria-hidden="true">auto_awesome</span>
          AI Destekli
        </div>
        <h1 className="text-3xl headline-tight text-on-surface">CİLT ANALİZİ</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          7 adımda cildini tanı, sana özel ürün ve rutin önerisi al.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps text-outline">Adım {step}/{TOTAL_STEPS}</span>
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
          <p className="text-sm text-on-surface-variant text-center mb-8">Cildinizi en iyi tanımlayan seçeneği işaretleyin.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setQuiz((p) => ({ ...p, skin_type: type.value }))}
                className={`curator-card p-5 text-left transition-all flex items-start gap-4 ${
                  quiz.skin_type === type.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon mt-0.5 ${quiz.skin_type === type.value ? 'text-primary' : type.color}`} aria-hidden="true">
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

      {/* Step 2: Age Range */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaş aralığın?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Yaşa uygun bakım önerileri için.</p>
          <div className="grid grid-cols-2 gap-3">
            {ageRanges.map((age) => (
              <button
                key={age.value}
                onClick={() => setQuiz((p) => ({ ...p, age_range: age.value }))}
                className={`curator-card p-5 text-center transition-all ${
                  quiz.age_range === age.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className="text-2xl font-bold text-on-surface block">{age.label}</span>
                <span className="text-xs text-on-surface-variant mt-1 block">{age.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Concerns */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">En önemli 3 ihtiyacını seç</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">{quiz.concerns.length}/3 seçildi</p>
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
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Sensitivities */}
      {step === 4 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Hassasiyetin var mı?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Varsa işaretle, yoksa atla.</p>
          <div className="grid grid-cols-2 gap-3">
            {sensitivities.map((s) => (
              <button
                key={s.key}
                onClick={() => setQuiz((p) => ({
                  ...p,
                  sensitivities: { ...p.sensitivities, [s.key]: !p.sensitivities[s.key] },
                }))}
                className={`curator-card p-5 text-center transition-all flex flex-col items-center gap-2 ${
                  quiz.sensitivities[s.key] ? 'border-error ring-1 ring-error bg-error/5' : 'hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon ${quiz.sensitivities[s.key] ? 'text-error' : 'text-outline-variant'}`} aria-hidden="true">
                  {s.icon}
                </span>
                <span className={`text-sm ${quiz.sensitivities[s.key] ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                  {s.label}
                </span>
                <span className="text-xs text-outline">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Routine */}
      {step === 5 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Günlük rutinin nasıl?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Mevcut bakım alışkanlıkların.</p>
          <div className="space-y-4">
            <div className="curator-card p-5">
              <label className="text-sm font-medium text-on-surface block mb-3">
                <span className="material-icon material-icon-sm text-score-medium mr-1.5 align-text-bottom" aria-hidden="true">light_mode</span>
                Sabah kaç adım?
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
              <label className="text-sm font-medium text-on-surface block mb-3">
                <span className="material-icon material-icon-sm text-primary mr-1.5 align-text-bottom" aria-hidden="true">dark_mode</span>
                Akşam kaç adım?
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

      {/* Step 6: Lifestyle */}
      {step === 6 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaşam tarzın</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Cilt sağlığını etkileyen faktörler.</p>
          <div className="space-y-4">
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
                      className={`flex-1 py-2 rounded-sm text-sm font-medium transition-colors ${
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

      {/* Step 7: Budget */}
      {step === 7 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bütçe tercihin?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Ürün başına harcama tercihin.</p>
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
