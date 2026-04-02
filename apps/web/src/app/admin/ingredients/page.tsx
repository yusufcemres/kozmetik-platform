'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'ingredient_id', label: 'ID' },
  { key: 'inci_name', label: 'INCI Adı' },
  { key: 'common_name', label: 'Yaygın Ad' },
  { key: 'ingredient_group', label: 'Grup' },
  { key: 'origin_type', label: 'Kaynak' },
  {
    key: 'evidence_level',
    label: 'Kanıt',
    render: (v: string) => v || '-',
  },
  {
    key: 'allergen_flag',
    label: 'Bayraklar',
    render: (_: any, row: any) => (
      <div className="flex gap-1">
        {row.allergen_flag && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Alerjen</span>}
        {row.fragrance_flag && <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">Parfüm</span>}
        {row.preservative_flag && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Koruyucu</span>}
      </div>
    ),
  },
];

const formFields: FormField[] = [
  { key: 'inci_name', label: 'INCI Adı', required: true, placeholder: 'Hyaluronic Acid' },
  { key: 'common_name', label: 'Yaygın Ad (TR)', placeholder: 'Hyaluronik Asit' },
  {
    key: 'domain_type', label: 'Domain', type: 'select', defaultValue: 'cosmetic',
    options: [
      { value: 'cosmetic', label: 'Kozmetik' },
      { value: 'supplement', label: 'Takviye' },
    ],
  },
  { key: 'ingredient_group', label: 'Grup', placeholder: 'Nemlendirici' },
  {
    key: 'origin_type', label: 'Kaynak Tipi', type: 'select',
    options: [
      { value: 'natural', label: 'Doğal' },
      { value: 'synthetic', label: 'Sentetik' },
      { value: 'semi-synthetic', label: 'Yarı-Sentetik' },
    ],
  },
  { key: 'function_summary', label: 'Fonksiyon Özeti', type: 'textarea', placeholder: 'Nemlendirme, bariyer desteği...' },
  { key: 'detailed_description', label: 'Detaylı Açıklama', type: 'textarea' },
  { key: 'sensitivity_note', label: 'Hassasiyet Notu', type: 'textarea' },
  { key: 'evidence_level', label: 'Kanıt Seviyesi', placeholder: 'strong / moderate / weak' },
  { key: 'allergen_flag', label: 'Alerjen', type: 'checkbox', defaultValue: false },
  { key: 'fragrance_flag', label: 'Parfüm İçerikli', type: 'checkbox', defaultValue: false },
  { key: 'preservative_flag', label: 'Koruyucu', type: 'checkbox', defaultValue: false },
];

export default function IngredientsPage() {
  const crud = useAdminCrud({ endpoint: '/ingredients', idField: 'ingredient_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditItem(row); setModalOpen(true); };

  const handleSubmit = async (data: Record<string, any>) => {
    if (editItem) {
      return crud.updateItem(editItem.ingredient_id, data);
    }
    return crud.createItem(data);
  };

  return (
    <div>
      <PageHeader
        title="İçerik Maddeleri"
        description="INCI bazlı içerik maddelerini yönetin"
        action={{ label: 'Yeni İçerik', onClick: openCreate }}
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
        searchPlaceholder="INCI adı ara..."
        onEdit={openEdit}
        onDelete={(row) => crud.deleteItem(row.ingredient_id)}
      />
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'İçerik Düzenle' : 'Yeni İçerik Maddesi'}
        fields={formFields}
        initialData={editItem}
      />
    </div>
  );
}
