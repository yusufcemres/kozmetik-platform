'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'revela_price_alerts';

export interface PriceAlert {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  current_price?: number;
  created_at: string;
}

export function getPriceAlerts(): PriceAlert[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function removePriceAlert(productId: number) {
  const alerts = getPriceAlerts().filter((a) => a.product_id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event('price-alerts-changed'));
}

function addPriceAlert(alert: PriceAlert) {
  const alerts = getPriceAlerts();
  if (alerts.some((a) => a.product_id === alert.product_id)) return;
  alerts.push(alert);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event('price-alerts-changed'));
}

interface Props {
  productId: number;
  productName: string;
  productSlug: string;
  brandName?: string;
  currentPrice?: number;
}

export default function PriceAlertButton({ productId, productName, productSlug, brandName, currentPrice }: Props) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const alerts = getPriceAlerts();
    setSubscribed(alerts.some((a) => a.product_id === productId));

    const handler = () => {
      const updated = getPriceAlerts();
      setSubscribed(updated.some((a) => a.product_id === productId));
    };
    window.addEventListener('price-alerts-changed', handler);
    return () => window.removeEventListener('price-alerts-changed', handler);
  }, [productId]);

  const handleToggle = () => {
    if (subscribed) {
      removePriceAlert(productId);
    } else {
      addPriceAlert({
        product_id: productId,
        product_name: productName,
        product_slug: productSlug,
        brand_name: brandName,
        current_price: currentPrice,
        created_at: new Date().toISOString(),
      });
    }
  };

  if (subscribed) {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-score-high-bg text-score-high text-xs font-medium hover:bg-score-high/10 transition-colors"
      >
        <span className="material-icon material-icon-sm" aria-hidden="true">notifications_active</span>
        Fiyat Alarmi Kuruldu
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary/30 text-primary hover:bg-primary/5 text-xs font-medium transition-colors"
    >
      <span className="material-icon material-icon-sm" aria-hidden="true">notifications_none</span>
      Fiyat Dustugunde Haber Ver
    </button>
  );
}
