'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Certificate {
  certificate_id: number;
  certificate_type: string;
  certificate_name: string;
  file_url?: string;
  issuing_body?: string;
  verification_status: string;
  created_at: string;
}

const CERT_TYPES = [
  { key: 'gmp', label: 'GMP', icon: 'verified_user' },
  { key: 'iso_22716', label: 'ISO 22716', icon: 'workspace_premium' },
  { key: 'dermatologist_test', label: 'Dermatolog Testi', icon: 'medical_services' },
  { key: 'clinical_study', label: 'Klinik Çalışma', icon: 'science' },
  { key: 'vegan', label: 'Vegan', icon: 'eco' },
  { key: 'cruelty_free', label: 'Cruelty-Free', icon: 'pets' },
  { key: 'stability_test', label: 'Stabilite Testi', icon: 'timer' },
  { key: 'lab_test', label: 'Laboratuvar Testi', icon: 'biotech' },
  { key: 'other', label: 'Diğer', icon: 'description' },
];

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Onay Bekliyor', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  verified: { label: 'Doğrulanmış', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function BrandCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('brand_token');
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }

    fetch(`${API_URL}/brand-portal/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Sertifikalar</h1>
        <p className="text-sm text-on-surface-variant">
          Sertifika yükleyerek şeffaflık puanınızı artırın.
        </p>
      </div>

      {/* Available cert types */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CERT_TYPES.map((ct) => {
          const existing = certificates.find((c) => c.certificate_type === ct.key);
          return (
            <div
              key={ct.key}
              className={`bg-surface rounded-xl border p-4 ${
                existing
                  ? 'border-green-300 dark:border-green-600/50'
                  : 'border-outline-variant/30 border-dashed'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-xl text-primary">
                  {ct.icon}
                </span>
                <span className="text-sm font-medium text-on-surface">{ct.label}</span>
              </div>
              {existing ? (
                <div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      STATUS_LABELS[existing.verification_status]?.cls || ''
                    }`}
                  >
                    {STATUS_LABELS[existing.verification_status]?.label}
                  </span>
                  {existing.issuing_body && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {existing.issuing_body}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  Henüz yüklenmedi
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Existing certificates table */}
      {certificates.length > 0 && (
        <div className="bg-surface rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20">
            <h2 className="text-base font-semibold text-on-surface">
              Yüklenen Sertifikalar ({certificates.length})
            </h2>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {certificates.map((c) => (
              <div key={c.certificate_id} className="flex items-center gap-4 p-4">
                <span className="material-symbols-outlined text-2xl text-primary">
                  {CERT_TYPES.find((ct) => ct.key === c.certificate_type)?.icon || 'description'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{c.certificate_name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {CERT_TYPES.find((ct) => ct.key === c.certificate_type)?.label}
                    {c.issuing_body && ` · ${c.issuing_body}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    STATUS_LABELS[c.verification_status]?.cls || ''
                  }`}
                >
                  {STATUS_LABELS[c.verification_status]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-container rounded-xl p-4">
        <p className="text-xs text-on-surface-variant">
          Sertifika yüklemek için şu an admin ile iletişime geçin. Self-service upload yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
