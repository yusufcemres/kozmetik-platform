'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getFavorites, removeFavorite, FavoriteItem,
  getRoutine, addToRoutine, removeFromRoutine, reorderRoutine,
  Routine, RoutineProduct,
} from '@/lib/favorites';

// === Tab States ===

type Tab = 'favorites' | 'routine';

// === Main Page ===

export default function FavoritesPage() {
  const [tab, setTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [routine, setRoutine] = useState<Routine>({ morning: [], evening: [] });

  useEffect(() => {
    setFavorites(getFavorites());
    setRoutine(getRoutine());
    const handler = () => {
      setFavorites(getFavorites());
      setRoutine(getRoutine());
    };
    window.addEventListener('favorites-changed', handler);
    window.addEventListener('routine-changed', handler);
    return () => {
      window.removeEventListener('favorites-changed', handler);
      window.removeEventListener('routine-changed', handler);
    };
  }, []);

  const handleRemoveFav = (id: number) => {
    setFavorites(removeFavorite(id));
  };

  const handleAddToRoutine = (period: 'morning' | 'evening', fav: FavoriteItem) => {
    const updated = addToRoutine(period, {
      product_id: fav.product_id,
      product_name: fav.product_name,
      product_slug: fav.product_slug,
      brand_name: fav.brand_name,
      image_url: fav.image_url,
    });
    setRoutine(updated);
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

  return (
    <div className="curator-section max-w-4xl mx-auto">
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Koleksiyon</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">FAVORILERIM</h1>
        <p className="text-on-surface-variant text-sm mt-2">Begendigi urunleri kaydet ve cilt bakim rutinini olustur.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-sm p-1 mb-8 w-fit">
        <button
          onClick={() => setTab('favorites')}
          className={`px-5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-colors ${
            tab === 'favorites' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Favorilerim ({favorites.length})
        </button>
        <button
          onClick={() => setTab('routine')}
          className={`px-5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-colors ${
            tab === 'routine' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Rutinim ({routine.morning.length + routine.evening.length})
        </button>
      </div>

      {/* Favorites Tab */}
      {tab === 'favorites' && (
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
                      {fav.brand_name && (
                        <p className="label-caps text-outline">{fav.brand_name}</p>
                      )}
                      <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors tracking-tight">
                        {fav.product_name}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group/menu">
                      <button className="label-caps text-primary bg-primary/5 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors">
                        + Rutine Ekle
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-surface border border-outline-variant/20 rounded-sm shadow-lg z-10 hidden group-hover/menu:block">
                        <button
                          onClick={() => handleAddToRoutine('morning', fav)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low whitespace-nowrap transition-colors"
                        >
                          <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">light_mode</span> Sabah Rutini
                        </button>
                        <button
                          onClick={() => handleAddToRoutine('evening', fav)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low whitespace-nowrap transition-colors"
                        >
                          <span className="material-icon material-icon-sm text-primary" aria-hidden="true">dark_mode</span> Aksam Rutini
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFav(fav.product_id)}
                      className="text-outline hover:text-error transition-colors p-1"
                      title="Kaldir"
                    >
                      <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Routine Tab */}
      {tab === 'routine' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="curator-card p-5 border-l-2 border-l-score-medium">
            <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">light_mode</span> Sabah Rutini
            </h3>
            {routine.morning.length === 0 ? (
              <p className="text-sm text-outline py-4 text-center">
                Favori urunlerinden sabah rutinine ekle
              </p>
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
                      <button
                        onClick={() => moveItem('morning', idx, -1)}
                        disabled={idx === 0}
                        className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors"
                      >
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_less</span>
                      </button>
                      <button
                        onClick={() => moveItem('morning', idx, 1)}
                        disabled={idx === routine.morning.length - 1}
                        className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors"
                      >
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_more</span>
                      </button>
                      <button
                        onClick={() => handleRemoveFromRoutine('morning', item.product_id)}
                        className="text-outline hover:text-error ml-1 transition-colors"
                      >
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
              <p className="text-sm text-outline py-4 text-center">
                Favori urunlerinden aksam rutinine ekle
              </p>
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
                      <button
                        onClick={() => moveItem('evening', idx, -1)}
                        disabled={idx === 0}
                        className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors"
                      >
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_less</span>
                      </button>
                      <button
                        onClick={() => moveItem('evening', idx, 1)}
                        disabled={idx === routine.evening.length - 1}
                        className="text-outline hover:text-on-surface disabled:opacity-20 transition-colors"
                      >
                        <span className="material-icon material-icon-sm" aria-hidden="true">expand_more</span>
                      </button>
                      <button
                        onClick={() => handleRemoveFromRoutine('evening', item.product_id)}
                        className="text-outline hover:text-error ml-1 transition-colors"
                      >
                        <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Routine tips */}
          <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
            <h3 className="font-semibold text-sm text-on-surface mb-3">Rutin Siralama Onerileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant">
              <div>
                <p className="font-semibold text-score-medium mb-1 flex items-center gap-1">
                  <span className="material-icon material-icon-sm" aria-hidden="true">light_mode</span> Sabah
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Temizleyici</li>
                  <li>Tonik</li>
                  <li>Serum (C Vitamini)</li>
                  <li>Goz Kremi</li>
                  <li>Nemlendirici</li>
                  <li>Gunes Kremi (SPF 30+)</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                  <span className="material-icon material-icon-sm" aria-hidden="true">dark_mode</span> Aksam
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Makyaj Temizleyici / Yag</li>
                  <li>Yuz Temizleyici</li>
                  <li>Tonik</li>
                  <li>Aktif (Retinol / AHA-BHA)</li>
                  <li>Serum</li>
                  <li>Goz Kremi</li>
                  <li>Nemlendirici / Gece Kremi</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
