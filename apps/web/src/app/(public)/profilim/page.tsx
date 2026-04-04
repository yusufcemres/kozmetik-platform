'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
}

const skinTypes = [
  { value: 'oily', label: 'Yagli', desc: 'Gun icinde parlama, genis gozenekler', icon: 'water_drop' },
  { value: 'dry', label: 'Kuru', desc: 'Sikillik hissi, pullanma', icon: 'air' },
  { value: 'combination', label: 'Karma', desc: 'T-bolge yagli, yanaklar kuru', icon: 'contrast' },
  { value: 'normal', label: 'Normal', desc: 'Dengeli nem, az sorun', icon: 'check_circle' },
  { value: 'sensitive', label: 'Hassas', desc: 'Kizariklik, tahris egilimi', icon: 'warning_amber' },
];

const sensitivities = [
  { key: 'fragrance', label: 'Parfum', icon: 'spa' },
  { key: 'alcohol', label: 'Alkol', icon: 'science' },
  { key: 'paraben', label: 'Paraben', icon: 'block' },
  { key: 'essential_oils', label: 'Esansiyel Yaglar', icon: 'eco' },
];

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<number[]>([]);
  const [selectedSensitivities, setSelectedSensitivities] = useState<Record<string, boolean>>({});
  const [needs, setNeeds] = useState<Need[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<{ data: Need[] }>('/needs?limit=50')
      .then((res) => setNeeds(res.data || []))
      .catch(() => {});

    try {
      const stored = localStorage.getItem('skin_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.skin_type) setSkinType(profile.skin_type);
        if (profile.concerns) setSelectedConcerns(profile.concerns);
        if (profile.sensitivities) setSelectedSensitivities(profile.sensitivities);
      }
    } catch {}
  }, []);

  const toggleConcern = (id: number) => {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const toggleSensitivity = (key: string) => {
    setSelectedSensitivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="curator-section max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Profil</span>
        <h1 className="text-3xl headline-tight text-on-surface">CILT PROFILI</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Profilini olustur, urunlerin sana ne kadar uygun oldugunu gor
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s === step ? 'bg-primary text-on-primary' : s < step ? 'bg-primary/20 text-primary' : 'bg-surface-container text-outline'
              }`}
            >
              {s < step ? (
                <span className="material-icon material-icon-sm" aria-hidden="true">check</span>
              ) : (
                s
              )}
            </div>
            {s < 3 && (
              <div className={`w-12 h-px ${s < step ? 'bg-primary' : 'bg-outline-variant/30'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Skin Type */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Cilt tipin ne?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSkinType(type.value)}
                className={`curator-card p-4 text-left transition-all flex items-start gap-3 ${
                  skinType === type.value
                    ? 'border-primary ring-1 ring-primary'
                    : ''
                }`}
              >
                <span className={`material-icon mt-0.5 ${skinType === type.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {type.icon}
                </span>
                <div>
                  <span className="font-semibold text-on-surface">{type.label}</span>
                  <span className="block text-xs text-on-surface-variant mt-0.5">{type.desc}</span>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => step < 3 && setStep(2)}
            disabled={!skinType}
            className="w-full mt-8 curator-btn-primary py-3 text-sm disabled:opacity-50"
          >
            DEVAM
          </button>
        </div>
      )}

      {/* Step 2: Concerns */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">En onemli 3 ihtiyacini sec</h2>
          <p className="text-sm text-on-surface-variant text-center mb-6">
            {selectedConcerns.length}/3 secildi
          </p>
          <div className="grid grid-cols-2 gap-3">
            {needs.map((need) => (
              <button
                key={need.need_id}
                onClick={() => toggleConcern(need.need_id)}
                className={`curator-card p-4 text-left text-sm transition-all ${
                  selectedConcerns.includes(need.need_id)
                    ? 'border-primary ring-1 ring-primary font-semibold text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                {need.need_name}
              </button>
            ))}
            {needs.length === 0 && (
              <p className="col-span-2 text-center text-sm text-outline py-4">
                Ihtiyaclar yukleniyor...
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="flex-1 curator-btn-outline py-3 text-sm">
              GERI
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedConcerns.length === 0}
              className="flex-1 curator-btn-primary py-3 text-sm disabled:opacity-50"
            >
              DEVAM
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sensitivities */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Hassasiyetin var mi?</h2>
          <div className="grid grid-cols-2 gap-3">
            {sensitivities.map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSensitivity(s.key)}
                className={`curator-card p-4 text-center text-sm transition-all flex flex-col items-center gap-2 ${
                  selectedSensitivities[s.key]
                    ? 'border-error ring-1 ring-error'
                    : ''
                }`}
              >
                <span className={`material-icon ${selectedSensitivities[s.key] ? 'text-error' : 'text-outline-variant'}`} aria-hidden="true">
                  {s.icon}
                </span>
                <span className={selectedSensitivities[s.key] ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(2)} className="flex-1 curator-btn-outline py-3 text-sm">
              GERI
            </button>
            <button
              onClick={() => {
                const existing = localStorage.getItem('skin_profile');
                const existingProfile = existing ? JSON.parse(existing) : {};
                const profile = {
                  anonymous_id: existingProfile.anonymous_id || crypto.randomUUID(),
                  skin_type: skinType,
                  concerns: selectedConcerns,
                  sensitivities: selectedSensitivities,
                  updated_at: new Date().toISOString(),
                };
                localStorage.setItem('skin_profile', JSON.stringify(profile));
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className="flex-1 curator-btn-primary py-3 text-sm"
            >
              {saved ? 'KAYDEDILDI!' : 'PROFILI KAYDET'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
