'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'category_id', label: 'ID' },
  { key: 'category_name', label: 'Kategori Adı' },
  { key: 'category_slug', label: 'Slug' },
  { key: 'domain_type', label: 'Domain' },
  { key: 'sort_order', label: 'Sıra' },
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

export default function CategoriesPage() {
  const crud = useAdminCrud({ endpoint: '/categories', idField: 'category_id' });

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerini yönetin"
        action={{ label: 'Yeni Kategori', onClick: () => {} }}
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
        searchPlaceholder="Kategori ara..."
        onEdit={() => {}}
        onDelete={(row) => crud.deleteItem(row.category_id)}
      />
    </div>
  );
}
