'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
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

export default function IngredientsPage() {
  const crud = useAdminCrud({ endpoint: '/ingredients', idField: 'ingredient_id' });

  return (
    <div>
      <PageHeader
        title="İçerik Maddeleri"
        description="INCI bazlı içerik maddelerini yönetin"
        action={{ label: 'Yeni İçerik', onClick: () => {} }}
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
        onEdit={() => {}}
        onDelete={(row) => crud.deleteItem(row.ingredient_id)}
      />
    </div>
  );
}
