'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'evidence_level_id', label: 'ID' },
  {
    key: 'badge_emoji',
    label: '',
    render: (v: string) => <span className="text-xl">{v || '-'}</span>,
  },
  { key: 'level_name', label: 'Seviye Adı' },
  { key: 'level_key', label: 'Anahtar' },
  { key: 'rank_order', label: 'Sıra' },
  {
    key: 'badge_color',
    label: 'Renk',
    render: (v: string) => (
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: v || '#999' }} />
        <span className="text-xs text-gray-500 font-mono">{v || '-'}</span>
      </div>
    ),
  },
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
  { key: 'level_key', label: 'Anahtar (unique)', required: true, placeholder: 'systematic_review' },
  { key: 'level_name', label: 'Seviye Adı', required: true, placeholder: 'Sistematik Derleme' },
  { key: 'description', label: 'Açıklama', type: 'textarea' },
  { key: 'rank_order', label: 'Sıra (1=en güçlü)', type: 'number', required: true, defaultValue: 1 },
  { key: 'badge_color', label: 'Badge Renk', placeholder: '#22c55e' },
  { key: 'badge_emoji', label: 'Badge Emoji', placeholder: '🟢' },
  { key: 'is_active', label: 'Aktif', type: 'checkbox', defaultValue: true },
];

export default function EvidenceLevelsPage() {
  const crud = useAdminCrud({ endpoint: '/evidence-levels', idField: 'evidence_level_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) return crud.updateItem(editItem.evidence_level_id, data);
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Kanıt Seviyeleri"
        description="8 seviyeli kanıt piramidi"
        action={{ label: 'Yeni Seviye', onClick: openCreate }}
      />
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.evidence_level_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Kanıt Seviyesi Düzenle' : 'Yeni Kanıt Seviyesi'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
