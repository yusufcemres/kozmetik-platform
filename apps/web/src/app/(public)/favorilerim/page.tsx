'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Favorilerim</h1>
      <p className="text-gray-500 mb-6 text-sm">Beğendiğin ürünleri kaydet ve cilt bakım rutinini oluştur.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        <button
          onClick={() => setTab('favorites')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'favorites' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Favorilerim ({favorites.length})
        </button>
        <button
          onClick={() => setTab('routine')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'routine' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rutinim ({routine.morning.length + routine.evening.length})
        </button>
      </div>

      {/* Favorites Tab */}
      {tab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">💝</p>
              <p className="text-gray-500">Henüz favorin yok</p>
              <p className="text-sm text-gray-400 mt-2">Ürün sayfalarındaki kalp ikonuna tıklayarak favori ekle</p>
              <Link href="/urunler" className="inline-block mt-4 text-primary hover:underline text-sm font-medium">
                Ürünleri Keşfet &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <div key={fav.product_id} className="bg-white border rounded-xl p-4 flex items-center gap-4 group">
                  <Link href={`/urunler/${fav.product_slug}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {fav.image_url ? (
                        <img src={fav.image_url} alt={fav.product_name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl text-gray-300">📦</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {fav.brand_name && (
                        <p className="text-xs text-primary font-semibold">{fav.brand_name}</p>
                      )}
                      <p className="text-sm font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                        {fav.product_name}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group/menu">
                      <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        + Rutine Ekle
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 hidden group-hover/menu:block">
                        <button
                          onClick={() => handleAddToRoutine('morning', fav)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                          ☀️ Sabah Rutini
                        </button>
                        <button
                          onClick={() => handleAddToRoutine('evening', fav)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                          🌙 Akşam Rutini
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFav(fav.product_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Kaldır"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>☀️</span> Sabah Rutini
            </h3>
            {routine.morning.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Favori ürünlerinden sabah rutinine ekle
              </p>
            ) : (
              <div className="space-y-2">
                {routine.morning.map((item, idx) => (
                  <div key={item.product_id} className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm">
                    <span className="text-xs font-bold text-amber-500 w-5">{idx + 1}</span>
                    <Link href={`/urunler/${item.product_slug}`} className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-semibold">{item.brand_name}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveItem('morning', idx, -1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem('morning', idx, 1)}
                        disabled={idx === routine.morning.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleRemoveFromRoutine('morning', item.product_id)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evening */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>🌙</span> Akşam Rutini
            </h3>
            {routine.evening.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Favori ürünlerinden akşam rutinine ekle
              </p>
            ) : (
              <div className="space-y-2">
                {routine.evening.map((item, idx) => (
                  <div key={item.product_id} className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm">
                    <span className="text-xs font-bold text-indigo-500 w-5">{idx + 1}</span>
                    <Link href={`/urunler/${item.product_slug}`} className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-semibold">{item.brand_name}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveItem('evening', idx, -1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem('evening', idx, 1)}
                        disabled={idx === routine.evening.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleRemoveFromRoutine('evening', item.product_id)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Routine tips */}
          <div className="md:col-span-2 bg-gray-50 border rounded-xl p-5">
            <h3 className="font-bold text-sm text-gray-700 mb-2">Rutin Sıralama Önerileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-semibold text-amber-600 mb-1">☀️ Sabah</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Temizleyici</li>
                  <li>Tonik</li>
                  <li>Serum (C Vitamini)</li>
                  <li>Göz Kremi</li>
                  <li>Nemlendirici</li>
                  <li>Güneş Kremi (SPF 30+)</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-indigo-600 mb-1">🌙 Akşam</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Makyaj Temizleyici / Yağ</li>
                  <li>Yüz Temizleyici</li>
                  <li>Tonik</li>
                  <li>Aktif (Retinol / AHA-BHA)</li>
                  <li>Serum</li>
                  <li>Göz Kremi</li>
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
