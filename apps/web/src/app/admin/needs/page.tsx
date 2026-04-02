'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'need_id', label: 'ID' },
  { key: 'need_name', label: 'İhtiyaç Adı' },
  { key: 'need_slug', label: 'Slug' },
  { key: 'need_group', label: 'Grup' },
  { key: 'user_friendly_label', label: 'Kullanıcı Etiketi' },
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
  { key: 'need_name', label: 'İhtiyaç Adı', required: true, placeholder: 'Sivilce / Akne' },
  {
    key: 'domain_type', label: 'Domain', type: 'select', defaultValue: 'cosmetic',
    options: [
      { value: 'cosmetic', label: 'Kozmetik' },
      { value: 'supplement', label: 'Takviye' },
    ],
  },
  { key: 'need_group', label: 'Grup', placeholder: 'Cilt Sorunları' },
  { key: 'user_friendly_label', label: 'Kullanıcı Etiketi', placeholder: 'Sivilce ve akne eğilimli cilt' },
  { key: 'short_description', label: 'Kısa Açıklama', type: 'textarea', placeholder: 'Kısa tanım...' },
  { key: 'detailed_description', label: 'Detaylı Açıklama', type: 'textarea' },
  { key: 'is_active', label: 'Aktif', type: 'checkbox', defaultValue: true },
];

export default function NeedsPage() {
  const crud = useAdminCrud({ endpoint: '/needs', idField: 'need_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.need_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="İhtiyaçlar"
        description="Cilt ihtiyaçlarını ve sorunlarını yönetin"
        action={{ label: 'Yeni İhtiyaç', onClick: openCreate }}
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
        searchPlaceholder="İhtiyaç ara..."
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.need_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'İhtiyaç Düzenle' : 'Yeni İhtiyaç'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
