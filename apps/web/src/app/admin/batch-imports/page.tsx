'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'import_id', label: 'ID' },
  { key: 'import_type', label: 'Tür' },
  { key: 'file_name', label: 'Dosya' },
  { key: 'total_rows', label: 'Toplam Satır' },
  { key: 'success_count', label: 'Başarılı' },
  { key: 'error_count', label: 'Hatalı' },
  {
    key: 'status',
    label: 'Durum',
    render: (v: string) => {
      const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || colors.pending}`}>
          {v}
        </span>
      );
    },
  },
];

export default function BatchImportsPage() {
  return (
    <div>
      <PageHeader title="Toplu Import" description="CSV import geçmişi" />
      <AdminTable columns={columns} data={[]} />
    </div>
  );
}
