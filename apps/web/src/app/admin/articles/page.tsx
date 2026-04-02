'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'article_id', label: 'ID' },
  { key: 'title', label: 'Başlık' },
  { key: 'content_type', label: 'Tür' },
  {
    key: 'status',
    label: 'Durum',
    render: (v: string) => {
      const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        in_review: 'bg-yellow-100 text-yellow-700',
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
  {
    key: 'published_at',
    label: 'Yayın Tarihi',
    render: (v: string) => v ? new Date(v).toLocaleDateString('tr-TR') : '-',
  },
];

const formFields: FormField[] = [
  { key: 'title', label: 'Başlık', required: true, placeholder: 'Niacinamide Rehberi: Faydaları ve Kullanımı' },
  {
    key: 'content_type', label: 'İçerik Türü', type: 'select', defaultValue: 'guide',
    options: [
      { value: 'guide', label: 'Rehber' },
      { value: 'ingredient_explainer', label: 'İçerik Anlatımı' },
      { value: 'need_guide', label: 'İhtiyaç Rehberi' },
      { value: 'label_reading', label: 'Etiket Okuma' },
      { value: 'comparison', label: 'Karşılaştırma' },
      { value: 'news', label: 'Haber' },
    ],
  },
  { key: 'summary', label: 'Özet', type: 'textarea', placeholder: 'Makale özeti...' },
  { key: 'body_markdown', label: 'İçerik (Markdown)', type: 'textarea', placeholder: '## Giriş\n\nMakale içeriği...' },
  {
    key: 'status', label: 'Durum', type: 'select', defaultValue: 'draft',
    options: [
      { value: 'draft', label: 'Taslak' },
      { value: 'in_review', label: 'İncelemede' },
      { value: 'published', label: 'Yayında' },
      { value: 'archived', label: 'Arşivlenmiş' },
    ],
  },
];

export default function ArticlesPage() {
  const crud = useAdminCrud({ endpoint: '/articles/admin', idField: 'article_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.article_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Makaleler"
        description="Blog ve rehber içerikleri yönetin"
        action={{ label: 'Yeni Makale', onClick: openCreate }}
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
        searchPlaceholder="Makale başlığı ara..."
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.article_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Makale Düzenle' : 'Yeni Makale'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
