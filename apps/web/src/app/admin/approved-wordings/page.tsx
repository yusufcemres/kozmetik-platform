'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'wording_id', label: 'ID' },
  { key: 'category', label: 'Kategori' },
  { key: 'approved_text', label: 'Onaylı İfade' },
  { key: 'forbidden_alternative', label: 'Yasak Alternatif' },
  { key: 'usage_note', label: 'Kullanım Notu' },
];

export default function ApprovedWordingsPage() {
  return (
    <div>
      <PageHeader
        title="Onaylı İfadeler"
        description="Güvenli ifade kütüphanesi — abartılı iddia önleme"
        action={{ label: 'Yeni İfade', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
