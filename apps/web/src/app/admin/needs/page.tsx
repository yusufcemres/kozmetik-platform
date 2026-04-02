'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'need_id', label: 'ID' },
  { key: 'need_name', label: 'İhtiyaç Adı' },
  { key: 'need_slug', label: 'Slug' },
  { key: 'need_group', label: 'Grup' },
  { key: 'user_friendly_label', label: 'Kullanıcı Etiketi' },
  {
    key: 'is_active',
    label: 'Durum',
    render: (v: boolean) => (
      <span className={`px-2 py-1 rounded text-xs ${v ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {v ? 'Aktif' : 'Pasif'}
      </span>
    ),
  },
];

export default function NeedsPage() {
  return (
    <div>
      <PageHeader
        title="İhtiyaçlar"
        description="Cilt ihtiyaçlarını ve sorunlarını yönetin"
        action={{ label: 'Yeni İhtiyaç', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
