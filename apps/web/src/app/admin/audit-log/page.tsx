'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'log_id', label: 'ID' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'entity_id', label: 'Entity ID' },
  { key: 'action', label: 'Aksiyon' },
  { key: 'admin_email', label: 'Admin' },
  {
    key: 'created_at',
    label: 'Tarih',
    render: (v: string) => v ? new Date(v).toLocaleString('tr-TR') : '-',
  },
];

export default function AuditLogPage() {
  const crud = useAdminCrud({ endpoint: '/admin/audit-logs', limit: 30 });

  return (
    <div>
      <PageHeader title="Audit Log" description="Tüm değişiklik geçmişi" />
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
      />
    </div>
  );
}
