'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'wording_id', label: 'ID' },
  { key: 'category', label: 'Kategori' },
  { key: 'approved_text', label: 'Onaylı İfade' },
  { key: 'forbidden_alternative', label: 'Yasak Alternatif' },
  { key: 'usage_note', label: 'Kullanım Notu' },
];

const formFields: FormField[] = [
  {
    key: 'category', label: 'Kategori', type: 'select', required: true,
    options: [
      { value: 'claim', label: 'İddia' },
      { value: 'benefit', label: 'Fayda' },
      { value: 'description', label: 'Tanım' },
      { value: 'warning', label: 'Uyarı' },
    ],
  },
  { key: 'approved_text', label: 'Onaylı İfade', required: true, type: 'textarea', placeholder: 'Cildi nemlendirmeye yardımcı olur' },
  { key: 'forbidden_alternative', label: 'Yasak Alternatif', type: 'textarea', placeholder: 'Kırışıklıkları yok eder' },
  { key: 'usage_note', label: 'Kullanım Notu', type: 'textarea', placeholder: 'Bu ifade sadece nemlendirici kategorisinde kullanılabilir' },
];

export default function ApprovedWordingsPage() {
  const crud = useAdminCrud({ endpoint: '/admin/approved-wordings', idField: 'wording_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.wording_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Onaylı İfadeler"
        description="Güvenli ifade kütüphanesi — abartılı iddia önleme"
        action={{ label: 'Yeni İfade', onClick: openCreate }}
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
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.wording_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'İfade Düzenle' : 'Yeni Onaylı İfade'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
