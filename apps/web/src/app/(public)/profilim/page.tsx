'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import {
  getFavorites, removeFavorite, FavoriteItem,
  getRoutine, addToRoutine, removeFromRoutine, reorderRoutine,
  Routine, RoutineProduct,
} from '@/lib/favorites';
import { getPriceAlerts, removePriceAlert, PriceAlert } from '@/components/public/PriceAlertButton';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
}

interface RecentProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  viewed_at: number;
}

interface InteractionWarning {
  interaction_id: number;
  ingredient_a: string;
  ingredient_b: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface SkinProfile {
  anonymous_id: string;
  skin_type: string;
  concerns: number[];
  sensitivities: Record<string, boolean>;
  age_range?: string;
  gender?: string;
  last_analysis?: {
    date: string;
    recommended_products: { product_id: number; product_name: string; score: number; slug: string }[];
  };
  updated_at: string;
}

type Tab = 'genel' | 'favoriler' | 'rutin' | 'gecmis';

// === Constants ===

const SKIN_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  oily: { label: 'Yagli', icon: 'water_drop' },
  dry: { label: 'Kuru', icon: 'air' },
  combination: { label: 'Karma', icon: 'contrast' },
  normal: { label: 'Normal', icon: 'check_circle' },
  sensitive: { label: 'Hassas', icon: 'warning_amber' },
};

const SENSITIVITY_LABELS: Record<string, string> = {
  fragrance: 'Parfum',
  alcohol: 'Alkol',
  paraben: 'Paraben',
  essential_oils: 'Esansiyel Yaglar',
};

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

const GENDER_OPTIONS = [
  { value: 'female', label: 'Kadin', icon: 'female' },
  { value: 'male', label: 'Erkek', icon: 'male' },
];

// === Main Component ===

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'genel';

  const [tab, setTab] = useState<Tab>(initialTab);
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [routine, setRoutine] = useState<Routine>({ morning: [], evening: [] });
  const [recentItems, setRecentItems] = useState<RecentProduct[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [editing, setEditing] = useState(false);
  const [routineWarnings, setRoutineWarnings] = useState<{
    morning: InteractionWarning[];
    evening: InteractionWarning[];
  }>({ morning: [], evening: [] });
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Edit state
  const [editSkinType, setEditSkinType] = useState('');
  const [editConcerns, setEditConcerns] = useState<number[]>([]);
  const [editSensitivities, setEditSensitivities] = useState<Record<string, boolean>>({});
  const [editGender, setEditGender] = useState('');
  const [editStep, setEditStep] = useState(1);

  const loadAll = useCallback(() => {
    try {
      const stored = localStorage.getItem('skin_profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
    setFavorites(getFavorites());
    setRoutine(getRoutine());
    setPriceAlerts(getPriceAlerts());
    try {
      const recent: RecentProduct[] = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      setRecentItems(recent);
    } catch {}
  }, []);

  useEffect(() => {
    loadAll();
    api.get<{ data: Need[] }>('/needs?limit=50').then((res) => setNeeds(res.data || [])).catch(() => {});

    const handler = () => loadAll();
    window.addEventListener('favorites-changed', handler);
    window.addEventListener('routine-changed', handler);
    window.addEventListener('recently-viewed-changed', handler);
    window.addEventListener('price-alerts-changed', handler);
    return () => {
      window.removeEventListener('favorites-changed', handler);
      window.removeEventListener('routine-changed', handler);
      window.removeEventListener('recently-viewed-changed', handler);
      window.removeEventListener('price-alerts-changed', handler);
    };
  }, [loadAll]);

  // Check routine interactions when routine changes
  useEffect(() => {
    const checkInteractions = async (ids: number[]) => {
      if (ids.length < 2) return [];
      try {
        return await api.post<InteractionWarning[]>('/interactions/check-products', { product_ids: ids });
      } catch { return []; }
    };

    const morningIds = routine.morning.map((r) => r.product_id);
    const eveningIds = routine.evening.map((r) => r.product_id);

    Promise.all([checkInteractions(morningIds), checkInteractions(eveningIds)]).then(
      ([m, e]) => setRoutineWarnings({ morning: m || [], evening: e || [] }),
    );
  }, [routine]);

  const startEditing = () => {
    if (profile) {
      setEditSkinType(profile.skin_type);
      setEditConcerns(profile.concerns || []);
      setEditSensitivities(profile.sensitivities || {});
      setEditGender(profile.gender || '');
    }
    setEditStep(1);
    setEditing(true);
  };

  const saveProfile = () => {
    const existing = profile || { anonymous_id: crypto.randomUUID() };
    const updated: SkinProfile = {
      ...existing,
      anonymous_id: existing.anonymous_id || crypto.randomUUID(),
      skin_type: editSkinType,
      concerns: editConcerns,
      sensitivities: editSensitivities,
      gender: editGender || undefined,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('skin_profile', JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
  };

  const toggleConcern = (id: number) => {
    setEditConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const concernNames = profile?.concerns
    ?.map((id) => needs.find((n) => n.need_id === id)?.need_name)
    .filter(Boolean) || [];

  const activeSensitivities = profile?.sensitivities
    ? Object.entries(profile.sensitivities)
        .filter(([, v]) => v)
        .map(([k]) => SENSITIVITY_LABELS[k] || k)
    : [];

  // Routine handlers
  const handleRemoveFav = (id: number) => setFavorites(removeFavorite(id));
  const handleAddToRoutine = (period: 'morning' | 'evening', fav: FavoriteItem) => {
    setRoutine(addToRoutine(period, {
      product_id: fav.product_id,
      product_name: fav.product_name,
      product_slug: fav.product_slug,
      brand_name: fav.brand_name,
      image_url: fav.image_url,
    }));
  };
  const handleRemoveFromRoutine = (period: 'morning' | 'evening', productId: number) => {
    setRoutine(removeFromRoutine(period, productId));
  };
  const moveItem = (period: 'morning' | 'evening', index: number, direction: -1 | 1) => {
    const list = [...routine[period]];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    setRoutine(reorderRoutine(period, list));
  };

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'genel', label: 'Genel', icon: 'person' },
    { key: 'favoriler', label: 'Favoriler', icon: 'favorite', count: favorites.length },
    { key: 'rutin', label: 'Rutinim', icon: 'event_note', count: routine.morning.length + routine.evening.length },
    { key: 'gecmis', label: 'Gecmis', icon: 'history', count: recentItems.length },
  ];

  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Profil</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">PROFILIM</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Senin hikayen, senin analiz raporun.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-sm p-1 mb-8 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.key ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-icon text-[16px]" aria-hidden="true">{t.icon}</span>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== GENEL TAB ===== */}
      {tab === 'genel' && !editing && (
        <div className="space-y-6">
          {/* Profile Summary Card */}
          {profile ? (
            <div className="curator-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-icon text-primary" aria-hidden="true">face</span>
                  Cilt Profili
                </h2>
                <button onClick={startEditing} className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1">
                  <span className="material-icon material-icon-sm" aria-hidden="true">edit</span>
                  Duzenle
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface-container-low rounded-sm p-3">
                  <p className="label-caps text-outline mb-1">Cilt Tipi</p>
                  <div className="flex items-center gap-1.5">
                    <span className="material-icon text-primary text-[18px]" aria-hidden="true">
                      {SKIN_TYPE_LABELS[profile.skin_type]?.icon || 'help'}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {SKIN_TYPE_LABELS[profile.skin_type]?.label || profile.skin_type}
                    </span>
                  </div>
                </div>

                {profile.gender && (
                  <div className="bg-surface-container-low rounded-sm p-3">
                    <p className="label-caps text-outline mb-1">Cinsiyet</p>
                    <span className="font-semibold text-on-surface">
                      {profile.gender === 'female' ? 'Kadin' : 'Erkek'}
                    </span>
                  </div>
                )}

                <div className="bg-surface-container-low rounded-sm p-3">
                  <p className="label-caps text-outline mb-1">Ihtiyaclar</p>
                  <div className="flex flex-wrap gap-1">
                    {concernNames.length > 0 ? concernNames.map((name) => (
                      <span key={name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{name}</span>
                    )) : <span className="text-xs text-outline">Belirtilmemis</span>}
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-sm p-3">
                  <p className="label-caps text-outline mb-1">Hassasiyetler</p>
                  <div className="flex flex-wrap gap-1">
                    {activeSensitivities.length > 0 ? activeSensitivities.map((s) => (
                      <span key={s} className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">{s}</span>
                    )) : <span className="text-xs text-outline">Yok</span>}
                  </div>
                </div>
              </div>

              <p className="text-xs text-outline mt-4">
                Son guncelleme: {new Date(profile.updated_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          ) : (
            <div className="curator-card p-8 text-center">
              <span className="material-icon text-outline-variant mb-3 block" style={{ fontSize: '48px' }} aria-hidden="true">face</span>
              <h2 className="text-lg font-bold text-on-surface mb-2">Cilt Profilini Olustur</h2>
              <p className="text-sm text-on-surface-variant mb-6">Cilt tipini, ihtiyaclarini ve hassasiyetlerini belirle — sana ozel oneriler al.</p>
              <button onClick={startEditing} className="curator-btn-primary text-[10px] px-8 py-3">
                PROFIL OLUSTUR
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {profile?.last_analysis && (
            <div className="curator-card p-6">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-icon text-primary" aria-hidden="true">analytics</span>
                Son Analiz Sonuclari
              </h2>
              <p className="text-sm text-on-surface-variant mb-3">
                {new Date(profile.last_analysis.date).toLocaleDateString('tr-TR')} tarihli analiz — {profile.last_analysis.recommended_products.length} urun onerildi
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.last_analysis.recommended_products.slice(0, 3).map((p) => (
                  <Link key={p.product_id} href={`/urunler/${p.slug}`} className="bg-surface-container-low rounded-sm p-3 hover:bg-surface-container transition-colors">
                    <p className="text-sm font-medium text-on-surface truncate">{p.product_name}</p>
                    <p className="text-xs text-primary font-bold mt-1">%{Math.round(p.score)} uyum</p>
                  </Link>
                ))}
              </div>
              <Link href="/cilt-analizi" className="inline-flex items-center gap-1 label-caps text-primary mt-4 hover:underline underline-offset-4">
                Yeniden Analiz Yap <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Price Alerts */}
          {priceAlerts.length > 0 && (
            <div className="curator-card p-6">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-icon text-primary" aria-hidden="true">notifications</span>
                Fiyat Alarmlarim
                <span className="text-xs font-normal text-on-surface-variant ml-1">({priceAlerts.length})</span>
              </h2>
              <div className="space-y-3">
                {priceAlerts.map((alert) => (
                  <div key={alert.product_id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-sm">
                    <span className="material-icon text-primary text-[20px] shrink-0" aria-hidden="true">notifications_active</span>
                    <Link href={`/urunler/${alert.product_slug}`} className="flex-1 min-w-0">
                      {alert.brand_name && (
                        <p className="label-caps text-outline mb-0.5">{alert.brand_name}</p>
                      )}
                      <p className="text-sm font-medium text-on-surface truncate hover:text-primary transition-colors">{alert.product_name}</p>
                      {alert.current_price && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Alarm kuruldu: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(alert.current_price)}
                        </p>
                      )}
                    </Link>
                    <button
                      onClick={() => removePriceAlert(alert.product_id)}
                      className="text-outline hover:text-error transition-colors shrink-0"
                      title="Alarmi kaldir"
                    >
                      <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="curator-card p-5 text-center">
              <span className="text-2xl font-bold text-on-surface">{favorites.length}</span>
              <p className="label-caps text-outline mt-1">Favori</p>
            </div>
            <div className="curator-card p-5 text-center">
              <span className="text-2xl font-bold text-on-surface">{routine.morning.length + routine.evening.length}</span>
              <p className="label-caps text-outline mt-1">Rutindeki Urun</p>
            </div>
            <div className="curator-card p-5 text-center">
              <span className="text-2xl font-bold text-on-surface">{recentItems.length}</span>
              <p className="label-caps text-outline mt-1">Incelenen</p>
            </div>
            <div className="curator-card p-5 text-center">
              <span className="text-2xl font-bold text-on-surface">
                {new Set(recentItems.map((r) => r.brand_name).filter(Boolean)).size}
              </span>
              <p className="label-caps text-outline mt-1">Marka</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/cilt-analizi" className="curator-card p-5 group flex items-center gap-3">
              <span className="material-icon text-primary text-[28px]" aria-hidden="true">water_drop</span>
              <div>
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">Cilt Analizi</p>
                <p className="text-xs text-on-surface-variant">Kisisel oneriler al</p>
              </div>
            </Link>
            <Link href="/onerilerimiz" className="curator-card p-5 group flex items-center gap-3">
              <span className="material-icon text-primary text-[28px]" aria-hidden="true">auto_awesome</span>
              <div>
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">Onerilerimiz</p>
                <p className="text-xs text-on-surface-variant">AI destekli secimler</p>
              </div>
            </Link>
            <Link href="/karsilastir" className="curator-card p-5 group flex items-center gap-3">
              <span className="material-icon text-primary text-[28px]" aria-hidden="true">compare_arrows</span>
              <div>
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">Karsilastir</p>
                <p className="text-xs text-on-surface-variant">Urunleri yan yana gor</p>
              </div>
            </Link>
          </div>

          {/* KVKK — Data Management */}
          <div className="curator-card p-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-2">
              <span className="material-icon text-outline" aria-hidden="true">shield</span>
              Veri Yonetimi
            </h2>
            <p className="text-sm text-on-surface-variant mb-5">
              REVELA tum verilerini tarayicinda (localStorage) saklar. Hesap veya sunucu kaydi bulunmaz.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const exportData: Record<string, unknown> = {};
                  const keys = ['skin_profile', 'kozmetik_favorites', 'kozmetik_routine', 'recently_viewed', 'revela_price_alerts', 'revela_onboarding_seen', 'revela_theme'];
                  keys.forEach((k) => {
                    try {
                      const val = localStorage.getItem(k);
                      if (val) exportData[k] = JSON.parse(val);
                    } catch {
                      const val = localStorage.getItem(k);
                      if (val) exportData[k] = val;
                    }
                  });
                  exportData._exported_at = new Date().toISOString();
                  exportData._platform = 'REVELA';
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `revela-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="curator-btn-outline text-[10px] px-6 py-3"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">download</span>
                Verilerimi Indir
              </button>
              <button
                onClick={() => {
                  if (confirm('Tum REVELA verileriniz silinecek (favoriler, rutin, profil, gecmis). Bu islem geri alinamaz. Devam etmek istiyor musunuz?')) {
                    const keys = ['skin_profile', 'kozmetik_favorites', 'kozmetik_routine', 'recently_viewed', 'revela_price_alerts', 'revela_onboarding_seen'];
                    keys.forEach((k) => localStorage.removeItem(k));
                    window.dispatchEvent(new Event('favorites-changed'));
                    window.dispatchEvent(new Event('routine-changed'));
                    window.dispatchEvent(new Event('recently-viewed-changed'));
                    window.dispatchEvent(new Event('price-alerts-changed'));
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-widest px-6 py-3 rounded-md border border-error/30 text-error hover:bg-error/5 transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">delete_forever</span>
                Verilerimi Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROFILE EDITOR ===== */}
      {tab === 'genel' && editing && (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === editStep ? 'bg-primary text-on-primary' : s < editStep ? 'bg-primary/20 text-primary' : 'bg-surface-container text-outline'
                }`}>
                  {s < editStep ? <span className="material-icon material-icon-sm" aria-hidden="true">check</span> : s}
                </div>
                {s < 4 && <div className={`w-8 h-px ${s < editStep ? 'bg-primary' : 'bg-outline-variant/30'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Gender */}
          {editStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Cinsiyetin</h2>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {GENDER_OPTIONS.map((g) => (
                  <button key={g.value} onClick={() => setEditGender(g.value)}
                    className={`curator-card p-5 text-center transition-all ${editGender === g.value ? 'border-primary ring-1 ring-primary' : ''}`}>
                    <span className="text-sm font-semibold text-on-surface">{g.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant text-center mt-3">Bu bilgi sana uygun urun onerileri icin kullanilir</p>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditing(false)} className="flex-1 curator-btn-outline py-3 text-sm">IPTAL</button>
                <button onClick={() => setEditStep(2)} className="flex-1 curator-btn-primary py-3 text-sm">DEVAM</button>
              </div>
            </div>
          )}

          {/* Step 2: Skin Type */}
          {editStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Cilt tipin ne?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skinTypes.map((type) => (
                  <button key={type.value} onClick={() => setEditSkinType(type.value)}
                    className={`curator-card p-4 text-left transition-all flex items-start gap-3 ${editSkinType === type.value ? 'border-primary ring-1 ring-primary' : ''}`}>
                    <span className={`material-icon mt-0.5 ${editSkinType === type.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{type.icon}</span>
                    <div>
                      <span className="font-semibold text-on-surface">{type.label}</span>
                      <span className="block text-xs text-on-surface-variant mt-0.5">{type.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditStep(1)} className="flex-1 curator-btn-outline py-3 text-sm">GERI</button>
                <button onClick={() => setEditStep(3)} disabled={!editSkinType} className="flex-1 curator-btn-primary py-3 text-sm disabled:opacity-50">DEVAM</button>
              </div>
            </div>
          )}

          {/* Step 3: Concerns */}
          {editStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-2 text-center">En onemli 3 ihtiyacini sec</h2>
              <p className="text-sm text-on-surface-variant text-center mb-6">{editConcerns.length}/3 secildi</p>
              <div className="grid grid-cols-2 gap-3">
                {needs.map((need) => (
                  <button key={need.need_id} onClick={() => toggleConcern(need.need_id)}
                    className={`curator-card p-4 text-left text-sm transition-all ${
                      editConcerns.includes(need.need_id) ? 'border-primary ring-1 ring-primary font-semibold text-on-surface' : 'text-on-surface-variant'
                    }`}>
                    {need.need_name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditStep(2)} className="flex-1 curator-btn-outline py-3 text-sm">GERI</button>
                <button onClick={() => setEditStep(4)} disabled={editConcerns.length === 0} className="flex-1 curator-btn-primary py-3 text-sm disabled:opacity-50">DEVAM</button>
              </div>
            </div>
          )}

          {/* Step 4: Sensitivities */}
          {editStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Hassasiyetin var mi?</h2>
              <div className="grid grid-cols-2 gap-3">
                {sensitivities.map((s) => (
                  <button key={s.key} onClick={() => setEditSensitivities((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                    className={`curator-card p-4 text-center text-sm transition-all flex flex-col items-center gap-2 ${
                      editSensitivities[s.key] ? 'border-error ring-1 ring-error' : ''
                    }`}>
                    <span className={`material-icon ${editSensitivities[s.key] ? 'text-error' : 'text-outline-variant'}`} aria-hidden="true">{s.icon}</span>
                    <span className={editSensitivities[s.key] ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditStep(3)} className="flex-1 curator-btn-outline py-3 text-sm">GERI</button>
                <button onClick={saveProfile} className="flex-1 curator-btn-primary py-3 text-sm">KAYDET</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FAVORILER TAB ===== */}
      {tab === 'favoriler' && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">favorite_border</span>
              <p className="text-on-surface-variant">Henuz favorin yok</p>
              <p className="text-sm text-outline mt-2">Urun sayfalarindaki kalp ikonuna tiklayarak favori ekle</p>
              <Link href="/urunler" className="inline-flex items-center gap-1 mt-4 label-caps text-primary hover:underline underline-offset-4">
                Urunleri Kesfet <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <div key={fav.product_id} className="curator-card p-4 flex items-center gap-4 group">
                  <Link href={`/urunler/${fav.product_slug}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-surface-container-low rounded-sm overflow-hidden shrink-0 flex items-center justify-center relative">
                      {fav.image_url ? (
                        <Image src={fav.image_url} alt={fav.product_name} fill sizes="64px" className="object-contain" />
                      ) : (
                        <span className="material-icon text-outline-variant" aria-hidden="true">inventory_2</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {fav.brand_name && <p className="label-caps text-outline">{fav.brand_name}</p>}
                      <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors tracking-tight">{fav.product_name}</p>
                      {fav.added_at && <p className="text-[10px] text-outline mt-0.5">{new Date(fav.added_at).toLocaleDateString('tr-TR')}</p>}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group/menu">
                      <button className="label-caps text-primary bg-primary/5 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors">
                        + Rutine Ekle
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-surface border border-outline-variant/20 rounded-sm shadow-lg z-10 hidden group-hover/menu:block">
                        <button onClick={() => handleAddToRoutine('morning', fav)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low whitespace-nowrap transition-colors">
                          <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">light_mode</span> Sabah Rutini
                        </button>
                        <button onClick={() => handleAddToRoutine('evening', fav)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low whitespace-nowrap transition-colors">
                          <span className="material-icon material-icon-sm text-primary" aria-hidden="true">dark_mode</span> Aksam Rutini
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFav(fav.product_id)} className="text-outline hover:text-error transition-colors p-1" title="Kaldir">
                      <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== RUTIN TAB ===== */}
      {tab === 'rutin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="curator-card p-5 border-l-2 border-l-score-medium">
            <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">light_mode</span> Sabah Rutini
            </h3>
            {routine.morning.length === 0 ? (
              <p className="text-sm text-outline py-4 text-center">Favori urunlerinden sabah rutinine ekle</p>
            ) : (
              <div className="space-y-2">
                {routine.morning.map((item, idx) => (
                  <div key={item.product_id} className="bg-surface-container-low rounded-sm p-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-score-medium w-5">{idx + 1}</span>
                    <Link href={`/urunler/${item.product_slug}`} className="flex-1 min-w-0">
                      <p className="label-caps text-outline">{item.brand_name}</p>
                      <p className="text-sm font-medium text-on-surface truncate">{item.product_name}</p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveItem('morning', idx, -1)} disabled={idx === 0} className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_less</span>
                      </button>
                      <button onClick={() => moveItem('morning', idx, 1)} disabled={idx === routine.morning.length - 1} className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_more</span>
                      </button>
                      <button onClick={() => handleRemoveFromRoutine('morning', item.product_id)} className="text-outline hover:text-error ml-1 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evening */}
          <div className="curator-card p-5 border-l-2 border-l-primary">
            <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">dark_mode</span> Aksam Rutini
            </h3>
            {routine.evening.length === 0 ? (
              <p className="text-sm text-outline py-4 text-center">Favori urunlerinden aksam rutinine ekle</p>
            ) : (
              <div className="space-y-2">
                {routine.evening.map((item, idx) => (
                  <div key={item.product_id} className="bg-surface-container-low rounded-sm p-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-primary w-5">{idx + 1}</span>
                    <Link href={`/urunler/${item.product_slug}`} className="flex-1 min-w-0">
                      <p className="label-caps text-outline">{item.brand_name}</p>
                      <p className="text-sm font-medium text-on-surface truncate">{item.product_name}</p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveItem('evening', idx, -1)} disabled={idx === 0} className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_less</span>
                      </button>
                      <button onClick={() => moveItem('evening', idx, 1)} disabled={idx === routine.evening.length - 1} className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_more</span>
                      </button>
                      <button onClick={() => handleRemoveFromRoutine('evening', item.product_id)} className="text-outline hover:text-error ml-1 transition-colors">
                        <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interaction warnings */}
          {(routineWarnings.morning.length > 0 || routineWarnings.evening.length > 0) && (
            <div className="md:col-span-2 bg-error/5 border border-error/20 rounded-sm p-5">
              <h3 className="font-bold text-sm text-error mb-3 flex items-center gap-2">
                <span className="material-icon" aria-hidden="true">warning</span>
                Icerik Etkileşim Uyarisi
              </h3>
              <div className="space-y-3">
                {routineWarnings.morning.map((w) => (
                  <div key={`m-${w.interaction_id}`} className="bg-surface rounded-sm p-3 border border-error/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">light_mode</span>
                      <span className="text-xs font-bold text-on-surface">Sabah Rutini</span>
                      <span className={`label-caps px-1.5 py-0.5 rounded-sm ${
                        w.severity === 'severe' ? 'bg-error/10 text-error' :
                        w.severity === 'moderate' ? 'bg-score-medium-bg text-score-medium' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>{w.severity === 'severe' ? 'Kaçının' : w.severity === 'moderate' ? 'Dikkat' : 'Bilgi'}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{w.ingredient_a}</span>
                      {' + '}
                      <span className="font-semibold text-on-surface">{w.ingredient_b}</span>
                      {' — '}{w.description}
                    </p>
                    {w.recommendation && (
                      <p className="text-xs text-primary mt-1">Oneri: {w.recommendation}</p>
                    )}
                  </div>
                ))}
                {routineWarnings.evening.map((w) => (
                  <div key={`e-${w.interaction_id}`} className="bg-surface rounded-sm p-3 border border-error/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icon material-icon-sm text-primary" aria-hidden="true">dark_mode</span>
                      <span className="text-xs font-bold text-on-surface">Aksam Rutini</span>
                      <span className={`label-caps px-1.5 py-0.5 rounded-sm ${
                        w.severity === 'severe' ? 'bg-error/10 text-error' :
                        w.severity === 'moderate' ? 'bg-score-medium-bg text-score-medium' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>{w.severity === 'severe' ? 'Kaçının' : w.severity === 'moderate' ? 'Dikkat' : 'Bilgi'}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{w.ingredient_a}</span>
                      {' + '}
                      <span className="font-semibold text-on-surface">{w.ingredient_b}</span>
                      {' — '}{w.description}
                    </p>
                    {w.recommendation && (
                      <p className="text-xs text-primary mt-1">Oneri: {w.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routine tips */}
          <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
            <h3 className="font-semibold text-sm text-on-surface mb-3">Rutin Siralama Onerileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant">
              <div>
                <p className="font-semibold text-score-medium mb-1 flex items-center gap-1">
                  <span className="material-icon material-icon-sm" aria-hidden="true">light_mode</span> Sabah
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Temizleyici</li><li>Tonik</li><li>Serum (C Vitamini)</li><li>Goz Kremi</li><li>Nemlendirici</li><li>Gunes Kremi (SPF 30+)</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                  <span className="material-icon material-icon-sm" aria-hidden="true">dark_mode</span> Aksam
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Makyaj Temizleyici / Yag</li><li>Yuz Temizleyici</li><li>Tonik</li><li>Aktif (Retinol / AHA-BHA)</li><li>Serum</li><li>Goz Kremi</li><li>Nemlendirici / Gece Kremi</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== GECMIS TAB ===== */}
      {tab === 'gecmis' && (
        <>
          {recentItems.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">history</span>
              <p className="text-on-surface-variant">Henuz urun incelemedin</p>
              <Link href="/urunler" className="inline-flex items-center gap-1 mt-4 label-caps text-primary hover:underline underline-offset-4">
                Urunleri Kesfet <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentItems.map((item) => (
                <Link key={`${item.product_id}-${item.viewed_at}`} href={`/urunler/${item.product_slug}`} className="curator-card overflow-hidden group">
                  <div className="aspect-square bg-surface-container-low overflow-hidden relative">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.product_name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="material-icon text-outline-variant flex items-center justify-center h-full" aria-hidden="true">inventory_2</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    {item.brand_name && <p className="label-caps text-outline text-[9px]">{item.brand_name}</p>}
                    <p className="text-xs font-semibold text-on-surface line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">{item.product_name}</p>
                    <p className="text-[10px] text-outline mt-1">
                      {new Date(item.viewed_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
