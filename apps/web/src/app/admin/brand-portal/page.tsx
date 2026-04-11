'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Application {
  account_id: number;
  email: string;
  representative_name: string;
  representative_title?: string;
  verification_status: string;
  created_at: string;
  brand?: { brand_name: string; origin_country?: string };
}

interface PendingEdit {
  edit_id: number;
  brand_account_id: number;
  product_id: number;
  field_name: string;
  old_value?: string;
  new_value?: string;
  status: string;
  created_at: string;
}

export default function AdminBrandPortalPage() {
  const [tab, setTab] = useState<'applications' | 'edits'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [edits, setEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const loadData = useCallback(() => {
    if (!token) return;
    setLoading(true);

    if (tab === 'applications') {
      fetch(`${API_URL}/brand-portal/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setApplications(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      fetch(`${API_URL}/brand-portal/admin/edits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setEdits(data.edits || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (accountId: number) => {
    await fetch(`${API_URL}/brand-portal/admin/verify/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ method: 'manual' }),
    });
    loadData();
  };

  const handleReject = async (accountId: number) => {
    if (!confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return;
    await fetch(`${API_URL}/brand-portal/admin/reject/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    loadData();
  };

  const handleEditReview = async (editId: number, approved: boolean) => {
    await fetch(`${API_URL}/brand-portal/admin/edits/${editId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ approved }),
    });
    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marka Portal Yönetimi</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('applications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'applications'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Başvurular ({applications.length})
        </button>
        <button
          onClick={() => setTab('edits')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'edits'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Düzenleme Onayları ({edits.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : tab === 'applications' ? (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">Bekleyen başvuru yok.</p>
          ) : (
            applications.map((app) => (
              <div
                key={app.account_id}
                className="bg-white border rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {app.brand?.brand_name || 'Marka'}
                    {app.brand?.origin_country && (
                      <span className="text-xs text-gray-500 ml-2">
                        {app.brand.origin_country}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {app.representative_name}
                    {app.representative_title && ` — ${app.representative_title}`}
                  </p>
                  <p className="text-xs text-gray-500">{app.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(app.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(app.account_id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(app.account_id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {edits.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">Bekleyen düzenleme yok.</p>
          ) : (
            edits.map((edit) => (
              <div
                key={edit.edit_id}
                className="bg-white border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium">
                      Ürün #{edit.product_id}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      Alan: {edit.field_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(edit.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {edit.old_value && (
                  <p className="text-xs text-gray-500">
                    Eski: <span className="line-through">{edit.old_value}</span>
                  </p>
                )}
                <p className="text-xs text-gray-700">
                  Yeni: <span className="font-medium">{edit.new_value}</span>
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditReview(edit.edit_id, true)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleEditReview(edit.edit_id, false)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
