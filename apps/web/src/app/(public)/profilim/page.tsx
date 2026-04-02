'use client';

import { useState } from 'react';

const skinTypes = [
  { value: 'oily', label: 'Yağlı' },
  { value: 'dry', label: 'Kuru' },
  { value: 'combination', label: 'Karma' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Hassas' },
];

const concerns = [
  { id: 1, label: 'Sivilce / Akne' },
  { id: 2, label: 'Leke / Hiperpigmentasyon' },
  { id: 3, label: 'Kırışıklık / Yaşlanma' },
  { id: 4, label: 'Kuruluk / Dehidrasyon' },
  { id: 5, label: 'Bariyer Desteği' },
  { id: 6, label: 'Gözenek Sıkılaştırma' },
  { id: 7, label: 'Cilt Tonu Eşitleme' },
  { id: 8, label: 'Güneş Koruması' },
];

const sensitivities = [
  { key: 'fragrance', label: 'Parfüm' },
  { key: 'alcohol', label: 'Alkol' },
  { key: 'paraben', label: 'Paraben' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar' },
];

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<number[]>([]);
  const [selectedSensitivities, setSelectedSensitivities] = useState<Record<string, boolean>>({});

  const toggleConcern = (id: number) => {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const toggleSensitivity = (key: string) => {
    setSelectedSensitivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">Cilt Profili</h1>
      <p className="text-gray-500 text-center mb-8">
        Profilini oluştur, ürünlerin sana ne kadar uygun olduğunu gör
      </p>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step ? 'bg-primary text-white' : s < step ? 'bg-primary/20 text-primary' : 'bg-gray-200'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Skin Type */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-center">Cilt tipin ne?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSkinType(type.value)}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  skinType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => step < 3 && setStep(2)}
            disabled={!skinType}
            className="w-full mt-8 bg-primary text-white py-3 rounded-lg disabled:opacity-50"
          >
            Devam
          </button>
        </div>
      )}

      {/* Step 2: Concerns */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-2 text-center">En önemli 3 ihtiyacını seç</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            {selectedConcerns.length}/3 seçildi
          </p>
          <div className="grid grid-cols-2 gap-3">
            {concerns.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleConcern(c.id)}
                className={`border-2 rounded-xl p-4 text-left text-sm transition-all ${
                  selectedConcerns.includes(c.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-lg">
              Geri
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedConcerns.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-lg disabled:opacity-50"
            >
              Devam
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sensitivities */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-center">Hassasiyetin var mı?</h2>
          <div className="grid grid-cols-2 gap-3">
            {sensitivities.map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSensitivity(s.key)}
                className={`border-2 rounded-xl p-4 text-center text-sm transition-all ${
                  selectedSensitivities[s.key]
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(2)} className="flex-1 border py-3 rounded-lg">
              Geri
            </button>
            <button
              onClick={() => {
                // Save to localStorage + API
                const profile = {
                  anonymous_id: crypto.randomUUID(),
                  skin_type: skinType,
                  concerns: selectedConcerns,
                  sensitivities: selectedSensitivities,
                };
                localStorage.setItem('skin_profile', JSON.stringify(profile));
                alert('Profil kaydedildi!');
              }}
              className="flex-1 bg-primary text-white py-3 rounded-lg"
            >
              Profili Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
