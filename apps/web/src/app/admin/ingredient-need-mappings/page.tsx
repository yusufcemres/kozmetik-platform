'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'ingredient_need_mapping_id', label: 'ID' },
  {
    key: 'ingredient',
    label: 'İçerik Maddesi',
    render: (_: any, row: any) => row.ingredient?.inci_name || '-',
  },
  {
    key: 'need',
    label: 'İhtiyaç',
    render: (_: any, row: any) => row.need?.need_name || '-',
  },
  { key: 'relevance_score', label: 'Skor (0-100)' },
  { key: 'effect_type', label: 'Etki Tipi' },
  { key: 'evidence_level', label: 'Kanıt Seviyesi' },
];

const formFields: FormField[] = [
  { key: 'ingredient_id', label: 'İçerik ID', type: 'number', required: true, placeholder: '1' },
  { key: 'need_id', label: 'İhtiyaç ID', type: 'number', required: true, placeholder: '1' },
  { key: 'relevance_score', label: 'Skor (0-100)', type: 'number', required: true, placeholder: '75' },
  {
    key: 'effect_type', label: 'Etki Tipi', type: 'select',
    options: [
      { value: 'beneficial', label: 'Faydalı' },
      { value: 'neutral', label: 'Nötr' },
      { value: 'harmful', label: 'Zararlı' },
      { value: 'conditional', label: 'Koşullu' },
    ],
  },
  {
    key: 'evidence_level', label: 'Kanıt Seviyesi', type: 'select',
    options: [
      { value: 'strong', label: 'Güçlü' },
      { value: 'moderate', label: 'Orta' },
      { value: 'limited', label: 'Sınırlı' },
      { value: 'anecdotal', label: 'Anekdotal' },
    ],
  },
  { key: 'description', label: 'Açıklama', type: 'textarea', placeholder: 'Bu eşleşme hakkında bilgi...' },
];

export default function MappingsPage() {
  const crud = useAdminCrud({ endpoint: '/ingredient-need-mappings', idField: 'ingredient_need_mapping_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.ingredient_need_mapping_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="İçerik-İhtiyaç Eşleşmeleri"
        description="İçerik maddeleri ile ihtiyaçlar arası ilişkiyi yönetin"
        action={{ label: 'Yeni Eşleşme', onClick: openCreate }}
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
        searchPlaceholder="İçerik veya ihtiyaç ara..."
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.ingredient_need_mapping_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Eşleşme Düzenle' : 'Yeni Eşleşme'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
