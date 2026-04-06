'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PriceAlertButton({ productId }: { productId: number }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY);
  }, []);

  if (!supported) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch(`${API_BASE}/price-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          push_subscription: subscription.toJSON(),
        }),
      });

      setSubscribed(true);
    } catch {
      // Permission denied or error
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-score-high-bg text-score-high text-xs font-medium"
      >
        <span className="material-icon material-icon-sm" aria-hidden="true">notifications_active</span>
        Fiyat Alarmı Kuruldu
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary/30 text-primary hover:bg-primary/5 text-xs font-medium transition-colors disabled:opacity-50"
    >
      <span className="material-icon material-icon-sm" aria-hidden="true">
        {loading ? 'hourglass_empty' : 'notifications_none'}
      </span>
      {loading ? 'Kuruluyor...' : 'Fiyat Düştüğünde Haber Ver'}
    </button>
  );
}
