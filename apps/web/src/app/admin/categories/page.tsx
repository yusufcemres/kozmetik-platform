'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
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

const formFields: FormField[] = [
  { key: 'category_name', label: 'Kategori Adı', required: true, placeholder: 'Yüz Bakım' },
  {
    key: 'domain_type', label: 'Domain', type: 'select', defaultValue: 'cosmetic',
    options: [
      { value: 'cosmetic', label: 'Kozmetik' },
      { value: 'supplement', label: 'Takviye' },
    ],
  },
  { key: 'sort_order', label: 'Sıralama', type: 'number', defaultValue: 0 },
  { key: 'is_active', label: 'Aktif', type: 'checkbox', defaultValue: true },
];

export default function CategoriesPage() {
  const crud = useAdminCrud({ endpoint: '/categories', idField: 'category_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.category_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerini yönetin"
        action={{ label: 'Yeni Kategori', onClick: openCreate }}
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
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.category_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Kategori Düzenle' : 'Yeni Kategori'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
