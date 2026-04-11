'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function BrandAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('brand_token');
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }

    fetch(`${API_URL}/brand-portal/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 403) throw new Error('Bu özellik Professional veya Enterprise plan gerektirir.');
        if (!r.ok) throw new Error('Veri yüklenemedi');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Analitik</h1>
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">
            lock
          </span>
          <p className="text-sm text-on-surface mb-2">{error}</p>
          <p className="text-xs text-on-surface-variant">
            Detaylı analitik raporlara erişmek için planınızı yükseltin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Analitik</h1>

      <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-primary mb-3">
          bar_chart
        </span>
        <p className="text-sm text-on-surface mb-1">Analitik modülü aktif</p>
        <p className="text-xs text-on-surface-variant">
          Detaylı görüntülenme, favori ve affiliate tıklama verileri yakında burada.
        </p>
      </div>
    </div>
  );
}
