'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

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

export default function MappingsPage() {
  return (
    <div>
      <PageHeader
        title="İçerik-İhtiyaç Eşleşmeleri"
        description="İçerik maddeleri ile ihtiyaçlar arası ilişkiyi yönetin"
        action={{ label: 'Yeni Eşleşme', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
