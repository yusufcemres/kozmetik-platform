'use client';

import { useState, useEffect } from 'react';

export default function BrandSettingsPage() {
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('brand_account');
      if (stored) setAccount(JSON.parse(stored));
    } catch {}
  }, []);

  if (!account) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Ayarlar</h1>

      {/* Account Info */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 p-6">
        <h2 className="text-base font-semibold text-on-surface mb-4">Hesap Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Marka" value={account.brand_name || '-'} />
          <InfoRow label="E-posta" value={account.email} />
          <InfoRow label="Temsilci" value={account.representative_name || '-'} />
          <InfoRow
            label="Doğrulama"
            value={
              account.verification_status === 'manually_verified' ||
              account.verification_status === 'domain_verified'
                ? 'Doğrulanmış'
                : account.verification_status === 'pending'
                ? 'Bekliyor'
                : account.verification_status
            }
          />
        </div>
      </div>

      {/* Plan Info */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 p-6">
        <h2 className="text-base font-semibold text-on-surface mb-4">Plan Bilgisi</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-on-surface capitalize">
            {account.plan || 'Starter'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Aktif
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          Plan yükseltme için destek ekibiyle iletişime geçin.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface rounded-xl border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
          Tehlikeli İşlemler
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          Hesabınızı devre dışı bırakmak geri alınamaz.
        </p>
        <button
          onClick={() => {
            if (confirm('Hesabınızı devre dışı bırakmak istediğinize emin misiniz?')) {
              alert('Lütfen destek ekibiyle iletişime geçin.');
            }
          }}
          className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Hesabı Devre Dışı Bırak
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-on-surface-variant">{label}</span>
      <p className="text-sm text-on-surface">{value}</p>
    </div>
  );
}
