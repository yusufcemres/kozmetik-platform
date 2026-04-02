'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';

interface WeightConfig {
  key: string;
  label: string;
  value: number;
}

const defaultWeights: WeightConfig[] = [
  { key: 'PRODUCT_NEED_COMPATIBILITY', label: 'Need Uyumu', value: 0.50 },
  { key: 'INGREDIENT_STRENGTH_MEAN', label: 'Ingredient Gücü', value: 0.20 },
  { key: 'LABEL_CONSISTENCY', label: 'Etiket Tutarlılığı', value: 0.15 },
  { key: 'CONTENT_COMPLETENESS', label: 'İçerik Tamlığı', value: 0.15 },
];

const defaultPenalties: WeightConfig[] = [
  { key: 'fragrance', label: 'Parfüm', value: 0.6 },
  { key: 'alcohol', label: 'Alkol', value: 0.7 },
  { key: 'paraben', label: 'Paraben', value: 0.8 },
  { key: 'essential_oils', label: 'Esansiyel Yağ', value: 0.75 },
];

export default function ScoringConfigPage() {
  const [weights, setWeights] = useState<WeightConfig[]>(defaultWeights);
  const [penalties, setPenalties] = useState<WeightConfig[]>(defaultPenalties);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    api.get<{ weights: Record<string, number>; penalties: Record<string, number> }>('/admin/scoring-config', { token })
      .then((data) => {
        if (data.weights) {
          setWeights((prev) => prev.map((w) => ({ ...w, value: data.weights[w.key] ?? w.value })));
        }
        if (data.penalties) {
          setPenalties((prev) => prev.map((p) => ({ ...p, value: data.penalties[p.key] ?? p.value })));
        }
      })
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false));
  }, []);

  const updateWeight = (key: string, value: number) => {
    setWeights((prev) => prev.map((w) => w.key === key ? { ...w, value } : w));
    setSaved(false);
  };

  const updatePenalty = (key: string, value: number) => {
    setPenalties((prev) => prev.map((p) => p.key === key ? { ...p, value } : p));
    setSaved(false);
  };

  const weightSum = weights.reduce((sum, w) => sum + w.value, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        weights: Object.fromEntries(weights.map((w) => [w.key, w.value])),
        penalties: Object.fromEntries(penalties.map((p) => [p.key, p.value])),
      };
      await api.put('/admin/scoring-config', payload, { token });
      setSaved(true);
    } catch (err: any) {
      alert(err.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Scoring Konfigürasyonu"
        description="Ağırlıkları ve katsayıları düzenleyin"
        action={{ label: saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi' : 'Kaydet', onClick: handleSave }}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">ProductRankScore Ağırlıkları</h3>
            <div className="space-y-4">
              {weights.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-600">{item.label}</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={item.value}
                      onChange={(e) => updateWeight(item.key, parseFloat(e.target.value) || 0)}
                      className="w-20 border rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 pt-3 border-t text-sm font-medium ${Math.abs(weightSum - 1) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              Toplam: {weightSum.toFixed(2)} {Math.abs(weightSum - 1) < 0.01 ? '' : '(1.00 olmalı!)'}
            </div>
          </div>

          {/* Penalties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">Hassasiyet Cezaları</h3>
            <p className="text-xs text-gray-500 mb-4">Düşük = sert ceza, 1.0 = ceza yok</p>
            <div className="space-y-4">
              {penalties.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-600">{item.label}</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={item.value}
                      onChange={(e) => updatePenalty(item.key, parseFloat(e.target.value) || 0)}
                      className="w-20 border rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${item.value < 0.7 ? 'bg-red-500' : item.value < 0.85 ? 'bg-orange-400' : 'bg-green-500'}`}
                      style={{ width: `${item.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Preview */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-3">Formül Önizleme</h3>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 space-y-1">
              <p>ProductRankScore =</p>
              {weights.map((w, i) => (
                <p key={w.key} className="pl-4">
                  {i > 0 ? '+ ' : '  '}{w.value.toFixed(2)} x {w.label}
                </p>
              ))}
              <p className="mt-3">PersonalScore = ProductRankScore x SensitivityPenalty</p>
              <p className="text-xs text-gray-500 mt-2">
                Penalties: {penalties.map((p) => `${p.label}=${p.value}`).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
