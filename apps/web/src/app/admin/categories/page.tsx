'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

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
  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerini yönetin"
        action={{ label: 'Yeni Kategori', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
