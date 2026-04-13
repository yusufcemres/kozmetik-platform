'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Props {
  userId: number;
  productId: number;
}

interface AllergyCheckResponse {
  alert: boolean;
  matched: Array<{ ingredient_id: number; inci_name: string }>;
}

export function AllergyAlertBanner({ userId, productId }: Props) {
  const [data, setData] = useState<AllergyCheckResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<AllergyCheckResponse>(`/profile-engine/user/${userId}/product/${productId}/allergy-check`)
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [userId, productId]);

  if (!data || !data.alert) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Profilinde alerjin var:</strong> Bu ürün{' '}
      {data.matched.map((m) => m.inci_name).join(', ')} içerir. Dikkat.
    </div>
  );
}
