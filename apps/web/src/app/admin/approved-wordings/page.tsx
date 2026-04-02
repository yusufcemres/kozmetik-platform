'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'wording_id', label: 'ID' },
  { key: 'category', label: 'Kategori' },
  { key: 'approved_text', label: 'Onaylı İfade' },
  { key: 'forbidden_alternative', label: 'Yasak Alternatif' },
  { key: 'usage_note', label: 'Kullanım Notu' },
];

export default function ApprovedWordingsPage() {
  const crud = useAdminCrud({ endpoint: '/admin/approved-wordings', idField: 'wording_id' });

  return (
    <div>
      <PageHeader
        title="Onaylı İfadeler"
        description="Güvenli ifade kütüphanesi — abartılı iddia önleme"
        action={{ label: 'Yeni İfade', onClick: () => {} }}
      />
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
        search={crud.search}
        onSearch={crud.handleSearch}
        searchPlaceholder="İfade ara..."
        onEdit={() => {}}
        onDelete={(row) => crud.deleteItem(row.wording_id)}
      />
    </div>
  );
}
