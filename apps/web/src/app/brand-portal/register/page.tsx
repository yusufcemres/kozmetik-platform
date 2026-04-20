'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

const API_URL = API_BASE_URL;

interface Brand {
  brand_id: number;
  brand_name: string;
  origin_country?: string;
}

const STEPS = [
  { title: 'Marka Seçimi', icon: 'storefront' },
  { title: 'Temsilci Bilgileri', icon: 'person' },
  { title: 'Hesap Bilgileri', icon: 'lock' },
  { title: 'Plan Seçimi', icon: 'workspace_premium' },
];

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: '₺299/ay',
    features: ['Marka sayfası claim', 'Logo + açıklama', '10 ürün düzenleme', 'Temel rozetler'],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '₺799/ay',
    badge: '14 gün ücretsiz',
    features: ['Sınırsız ürün', 'Sertifika yükleme', 'Şeffaflık rozeti', 'Temel istatistikler', 'İleri rozetler'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '₺1,999/ay',
    features: ['Q&A modülü', 'Detaylı analytics', 'Öne çıkan ürün', 'API erişimi', 'Dedicated destek', 'Elit rozetler'],
  },
];

export default function BrandRegisterPage() {
  const [step, setStep] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    brand_id: 0,
    brand_name: '',
    representative_name: '',
    representative_title: '',
    phone: '',
    email: '',
    password: '',
    password_confirm: '',
    plan: 'starter',
  });

  useEffect(() => {
    if (brandSearch.length >= 2) {
      fetch(`${API_URL}/brands?search=${encodeURIComponent(brandSearch)}&limit=10`)
        .then((r) => r.json())
        .then((data) => setBrands(Array.isArray(data) ? data : data.data || []))
        .catch(() => setBrands([]));
    }
  }, [brandSearch]);

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return form.brand_id > 0;
    if (step === 1) return form.representative_name.length >= 2;
    if (step === 2) return form.email.includes('@') && form.password.length >= 6 && form.password === form.password_confirm;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/brand-portal/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: form.brand_id,
          email: form.email,
          password: form.password,
          representative_name: form.representative_name,
          representative_title: form.representative_title || undefined,
          phone: form.phone || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Kayıt başarısız');
      }

      const data = await res.json();
      localStorage.setItem('brand_token', data.access_token);
      localStorage.setItem('brand_account', JSON.stringify(data.account));
      window.location.href = '/brand-portal/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-lowest flex items-center justify-center py-8 px-4">
      <div className="bg-surface rounded-2xl shadow-lg w-full max-w-lg border border-outline-variant/30">
        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i <= step
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {i < step ? (
                    <span className="material-symbols-outlined text-base">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      i < step ? 'bg-primary' : 'bg-outline-variant/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-on-surface">{STEPS[step].title}</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            Adım {step + 1}/{STEPS.length}
          </p>
        </div>

        {error && (
          <div className="mx-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="px-6 pb-6">
          {/* Step 0: Brand Selection */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                REVELA&apos;daki mevcut markalardan birini seçin.
              </p>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Marka adı ara..."
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              {brands.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-outline-variant/30 rounded-lg divide-y divide-outline-variant/20">
                  {brands.map((b) => (
                    <button
                      key={b.brand_id}
                      onClick={() => {
                        updateForm('brand_id', b.brand_id);
                        updateForm('brand_name', b.brand_name);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-surface-container transition-colors ${
                        form.brand_id === b.brand_id ? 'bg-primary/10 font-medium' : ''
                      }`}
                    >
                      <span className="text-sm text-on-surface">{b.brand_name}</span>
                      {b.origin_country && (
                        <span className="text-xs text-on-surface-variant ml-2">
                          {b.origin_country}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {form.brand_id > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm text-on-surface">
                  Seçilen marka: <strong>{form.brand_name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Representative Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={form.representative_name}
                  onChange={(e) => updateForm('representative_name', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Marka temsilcisi adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Pozisyon
                </label>
                <input
                  type="text"
                  value={form.representative_title}
                  onChange={(e) => updateForm('representative_title', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Pazarlama Müdürü"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          )}

          {/* Step 2: Account Credentials */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Kurumsal E-posta *
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="temsilci@marka.com"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  Marka web sitesiyle eşleşen domain kullanmanız doğrulamayı hızlandırır.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Şifre Tekrar *
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.password_confirm}
                  onChange={(e) => updateForm('password_confirm', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                {form.password_confirm && form.password !== form.password_confirm && (
                  <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.key}
                  onClick={() => updateForm('plan', plan.key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.plan === plan.key
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-on-surface">{plan.name}</span>
                      {plan.badge && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant">
                      {plan.price}
                    </span>
                  </div>
                  <ul className="text-xs text-on-surface-variant space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">
                          check_circle
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/20">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-on-surface-variant hover:text-on-surface"
              >
                ← Geri
              </button>
            ) : (
              <Link
                href="/brand-portal/login"
                className="text-sm text-on-surface-variant hover:text-on-surface"
              >
                Zaten hesabım var
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 text-sm font-medium"
              >
                Devam →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
