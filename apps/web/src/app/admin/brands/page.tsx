'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'brand_id', label: 'ID' },
  { key: 'brand_name', label: 'Marka Adı' },
  { key: 'brand_slug', label: 'Slug' },
  { key: 'country_of_origin', label: 'Ülke' },
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

export default function BrandsPage() {
  const crud = useAdminCrud({ endpoint: '/brands', idField: 'brand_id' });

  return (
    <div>
      <PageHeader
        title="Markalar"
        description="Kozmetik markalarını yönetin"
        action={{ label: 'Yeni Marka', onClick: () => {} }}
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
        searchPlaceholder="Marka ara..."
        onEdit={() => {}}
        onDelete={(row) => crud.deleteItem(row.brand_id)}
      />
    </div>
  );
}
