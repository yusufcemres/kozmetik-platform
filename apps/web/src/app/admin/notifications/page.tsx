'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';

interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
  expired: number;
}

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [icon, setIcon] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    api
      .get<{ active: number }>('/notifications/broadcast/stats', { token })
      .then((r) => setActiveCount(r.active))
      .catch(() => setActiveCount(null));
  }, [token]);

  const handleSend = async () => {
    setError(null);
    setResult(null);
    if (!title.trim() || !body.trim()) {
      setError('Başlık ve içerik zorunlu');
      return;
    }

    setSending(true);
    try {
      if (testMode) {
        // Test mode: send to current user only (requires user token, not admin)
        const userToken =
          typeof window !== 'undefined' ? localStorage.getItem('revela_user_token') || '' : '';
        if (!userToken) {
          setError('Test modu için kullanıcı olarak da giriş yapman gerek (/giris)');
          setSending(false);
          return;
        }
        await api.post('/notifications/test', {}, { token: userToken });
        setResult({ total: 1, sent: 1, failed: 0, expired: 0 });
      } else {
        if (!confirm(`${activeCount ?? '?'} aboneye push gönderilecek. Devam?`)) {
          setSending(false);
          return;
        }
        const res = await api.post<BroadcastResult>(
          '/notifications/broadcast',
          { title, body, url: url || undefined, icon: icon || undefined },
          { token },
        );
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Gönderim başarısız');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Push Bildirim" description="Tüm abonelere veya test olarak push gönder" />

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Aktif Abone</p>
            <p className="text-2xl font-semibold text-gray-900">{activeCount ?? '—'}</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Test modu (sadece kendine gönder)</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Başlık *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="Örn: Yeni ürün eklendi"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-gray-500 mt-1">{title.length}/60</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">İçerik *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={140}
            rows={3}
            placeholder="Örn: Cildine uygun yeni bir tonik analiz edildi."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-gray-500 mt-1">{body.length}/140</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hedef URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Icon URL (opsiyonel)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="/icon-192.png"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm">
            <p className="font-semibold mb-1">Gönderim tamamlandı</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div><span className="text-gray-600">Toplam:</span> {result.total}</div>
              <div><span className="text-gray-600">Başarılı:</span> {result.sent}</div>
              <div><span className="text-gray-600">Başarısız:</span> {result.failed}</div>
              <div><span className="text-gray-600">Expired (410):</span> {result.expired}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-blue-600 text-white py-2.5 rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Gönderiliyor…' : testMode ? 'Test Push Gönder' : `Tüm Abonelere Gönder${activeCount !== null ? ` (${activeCount})` : ''}`}
        </button>
      </div>
    </div>
  );
}
