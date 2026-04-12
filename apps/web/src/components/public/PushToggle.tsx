'use client';

import { useEffect, useState } from 'react';
import {
  isPushSupported,
  isSubscribedToPush,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push';

export default function PushToggle() {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      setLoading(false);
      return;
    }
    isSubscribedToPush().then((s) => {
      setEnabled(s);
      setLoading(false);
    });
  }, []);

  const toggle = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
        setMessage('Bildirimler kapatıldı');
      } else {
        const res = await subscribeToPush();
        setEnabled(res.success);
        setMessage(res.message);
      }
    } catch (err: any) {
      setMessage(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="border border-outline-variant/20 rounded-sm p-4">
        <div className="text-sm font-semibold text-on-surface mb-1">Bildirimler</div>
        <p className="text-xs text-on-surface-variant">Bu tarayıcı push bildirim desteklemiyor.</p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 rounded-sm p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-icon text-[16px]" aria-hidden="true">notifications</span>
            Bildirimler
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Yeni ürünler, fiyat düşüşleri ve kampanyalardan haberdar ol.
          </p>
          {message && (
            <p className="text-xs text-primary mt-2">{message}</p>
          )}
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-outline-variant/40'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
