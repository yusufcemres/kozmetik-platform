'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'correction_id', label: 'ID' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'entity_id', label: 'Entity ID' },
  { key: 'correction_text', label: 'Düzeltme Metni' },
  { key: 'reporter_email', label: 'Bildiren' },
  {
    key: 'status',
    label: 'Durum',
    render: (v: string) => {
      const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || colors.pending}`}>
          {v}
        </span>
      );
    },
  },
];

export default function CorrectionsPage() {
  const crud = useAdminCrud({ endpoint: '/admin/corrections', idField: 'correction_id' });

  return (
    <div>
      <PageHeader title="Düzeltme Bildirimleri" description="Kullanıcılardan gelen hata bildirimleri" />
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
        onEdit={() => {}}
      />
    </div>
  );
}
