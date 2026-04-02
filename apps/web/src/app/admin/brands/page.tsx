'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
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

const formFields: FormField[] = [
  { key: 'brand_name', label: 'Marka Adı', required: true, placeholder: 'La Roche-Posay' },
  { key: 'country_of_origin', label: 'Menşei Ülke', placeholder: 'Fransa' },
  { key: 'website_url', label: 'Web Sitesi', placeholder: 'https://...' },
  { key: 'logo_url', label: 'Logo URL', placeholder: 'https://...' },
  { key: 'is_active', label: 'Aktif', type: 'checkbox', defaultValue: true },
];

export default function BrandsPage() {
  const crud = useAdminCrud({ endpoint: '/brands', idField: 'brand_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) return crud.updateItem(editItem.brand_id, data);
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Markalar"
        description="Kozmetik markalarını yönetin"
        action={{ label: 'Yeni Marka', onClick: openCreate }}
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
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.brand_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Marka Düzenle' : 'Yeni Marka'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
