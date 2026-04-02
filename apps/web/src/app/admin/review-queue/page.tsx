'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'product_ingredient_id', label: 'ID' },
  { key: 'ingredient_display_name', label: 'Görünen İsim' },
  { key: 'listed_as_raw', label: 'Ham INCI' },
  {
    key: 'match_status',
    label: 'Eşleşme',
    render: (v: string) => {
      const colors: Record<string, string> = {
        auto_matched: 'bg-green-100 text-green-700',
        suggested: 'bg-yellow-100 text-yellow-700',
        review_needed: 'bg-red-100 text-red-700',
        manual_matched: 'bg-blue-100 text-blue-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || 'bg-gray-100 text-gray-700'}`}>
          {v?.replace(/_/g, ' ') || '-'}
        </span>
      );
    },
  },
  {
    key: 'match_confidence',
    label: 'Güven',
    render: (v: number) => v ? `%${Math.round(v * 100)}` : '-',
  },
];

const formFields: FormField[] = [
  { key: 'ingredient_id', label: 'Eşleştirilecek İçerik ID', type: 'number', placeholder: 'Doğru ingredient_id girin' },
  {
    key: 'match_status', label: 'Durum', type: 'select', required: true,
    options: [
      { value: 'manual_matched', label: 'Manuel Eşleştirildi' },
      { value: 'auto_matched', label: 'Otomatik Onay' },
      { value: 'review_needed', label: 'Hâlâ İnceleme Gerekli' },
    ],
  },
  { key: 'admin_note', label: 'Not', type: 'textarea', placeholder: 'Eşleştirme notu...' },
];

export default function ReviewQueuePage() {
  const [filter, setFilter] = useState<'suggested' | 'review_needed'>('review_needed');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const crud = useAdminCrud({
    endpoint: `/admin/review-queue?status=${filter}`,
    idField: 'product_ingredient_id',
  });

  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.product_ingredient_id, data);
    }
    return false;
  };

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Otomatik eşleşmeyen veya düşük güvenli ingredient eşleşmeleri"
      />
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('suggested')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filter === 'suggested' ? 'bg-yellow-200 text-yellow-900' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-150'
          }`}
        >
          Suggestion
        </button>
        <button
          onClick={() => setFilter('review_needed')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filter === 'review_needed' ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-800 hover:bg-red-150'
          }`}
        >
          Review Needed
        </button>
      </div>
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
        onEdit={openEdit}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title="Eşleşme İncele"
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
