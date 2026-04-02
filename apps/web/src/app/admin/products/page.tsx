'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'product_id', label: 'ID' },
  { key: 'product_name', label: 'Ürün Adı' },
  {
    key: 'brand',
    label: 'Marka',
    render: (_: any, row: any) => row.brand?.brand_name || '-',
  },
  {
    key: 'category',
    label: 'Kategori',
    render: (_: any, row: any) => row.category?.category_name || '-',
  },
  {
    key: 'status',
    label: 'Durum',
    render: (v: string) => {
      const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || colors.draft}`}>
          {v}
        </span>
      );
    },
  },
];

export default function ProductsPage() {
  const crud = useAdminCrud({ endpoint: '/products', limit: 15, idField: 'product_id' });

  return (
    <div>
      <PageHeader
        title="Ürünler"
        description="Kozmetik ürünlerini yönetin"
        action={{ label: 'Yeni Ürün', onClick: () => {} }}
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
        searchPlaceholder="Ürün adı veya marka ara..."
        onEdit={() => {}}
        onDelete={(row) => crud.deleteItem(row.product_id)}
      />
    </div>
  );
}
