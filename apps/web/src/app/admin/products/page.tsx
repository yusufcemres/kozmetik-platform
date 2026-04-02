'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
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

const formFields: FormField[] = [
  { key: 'product_name', label: 'Ürün Adı', required: true, placeholder: 'Effaclar Duo+ SPF30' },
  { key: 'brand_id', label: 'Marka ID', type: 'number', required: true, placeholder: '1' },
  { key: 'category_id', label: 'Kategori ID', type: 'number', required: true, placeholder: '1' },
  {
    key: 'domain_type', label: 'Domain', type: 'select', defaultValue: 'cosmetic',
    options: [
      { value: 'cosmetic', label: 'Kozmetik' },
      { value: 'supplement', label: 'Takviye' },
    ],
  },
  { key: 'product_type_label', label: 'Ürün Tipi', placeholder: 'Nemlendirici Krem' },
  { key: 'short_description', label: 'Kısa Açıklama', type: 'textarea', placeholder: 'Ürün hakkında kısa bilgi...' },
  { key: 'barcode', label: 'Barkod', placeholder: '8690572...' },
  { key: 'target_area', label: 'Hedef Bölge', placeholder: 'Yüz' },
  { key: 'usage_time_hint', label: 'Kullanım Zamanı', placeholder: 'Sabah ve akşam' },
  {
    key: 'status', label: 'Durum', type: 'select', defaultValue: 'draft',
    options: [
      { value: 'draft', label: 'Taslak' },
      { value: 'published', label: 'Yayında' },
      { value: 'archived', label: 'Arşivlenmiş' },
    ],
  },
];

export default function ProductsPage() {
  const crud = useAdminCrud({ endpoint: '/products', limit: 15, idField: 'product_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.product_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="Ürünler"
        description="Kozmetik ürünlerini yönetin"
        action={{ label: 'Yeni Ürün', onClick: openCreate }}
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
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.product_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Ürün Düzenle' : 'Yeni Ürün'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
