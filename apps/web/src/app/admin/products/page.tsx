'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal, { FormField } from '@/components/admin/AdminFormModal';
import { useAdminCrud } from '@/lib/useAdminCrud';
import { api } from '@/lib/api';

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

// formFields artik dinamik — brand/category dropdownleri runtime'da yuklenir
function buildFormFields(
  brands: { value: string; label: string }[],
  categories: { value: string; label: string }[],
): FormField[] {
  return [
    { key: 'product_name', label: 'Ürün Adı', required: true, placeholder: 'Effaclar Duo+ SPF30' },
    {
      key: 'brand_id',
      label: 'Marka',
      type: 'select',
      required: true,
      options: [{ value: '', label: '— marka seç —' }, ...brands],
    },
    {
      key: 'category_id',
      label: 'Kategori',
      type: 'select',
      required: true,
      options: [{ value: '', label: '— kategori seç —' }, ...categories],
    },
    {
      key: 'domain_type', label: 'Domain', type: 'select', defaultValue: 'cosmetic',
      options: [
        { value: 'cosmetic', label: 'Kozmetik' },
        { value: 'supplement', label: 'Takviye' },
      ],
    },
    { key: 'product_type_label', label: 'Ürün Tipi', placeholder: 'Nemlendirici Krem, Serum, Şampuan…' },
    { key: 'short_description', label: 'Kısa Açıklama (2-3 cümle)', type: 'textarea', placeholder: 'Ürün hakkında kısa bilgi…' },
    { key: 'barcode', label: 'Barkod (EAN-13 / GTIN)', placeholder: '8690572…' },
    { key: 'net_content_value', label: 'Hacim/Miktar', type: 'number', placeholder: '50' },
    {
      key: 'net_content_unit', label: 'Birim', type: 'select', defaultValue: 'ml',
      options: [
        { value: 'ml', label: 'ml' },
        { value: 'g', label: 'g' },
        { value: 'kapsül', label: 'kapsül' },
        { value: 'tablet', label: 'tablet' },
        { value: 'adet', label: 'adet' },
      ],
    },
    { key: 'target_area', label: 'Hedef Bölge', placeholder: 'Yüz, Vücut, Saç…' },
    {
      key: 'target_audience', label: 'Hedef Kitle', type: 'select', defaultValue: 'adult',
      options: [
        { value: 'adult', label: 'Yetişkin' },
        { value: 'child', label: 'Çocuk' },
        { value: 'baby', label: 'Bebek' },
        { value: 'pregnant', label: 'Hamile' },
        { value: 'senior', label: 'Yaşlı' },
      ],
    },
    {
      key: 'target_gender', label: 'Cinsiyet', type: 'select',
      options: [
        { value: '', label: 'Belirsiz / Unisex' },
        { value: 'female', label: 'Kadın' },
        { value: 'male', label: 'Erkek' },
        { value: 'unisex', label: 'Unisex' },
      ],
    },
    { key: 'usage_time_hint', label: 'Kullanım Zamanı', placeholder: 'Sabah ve akşam' },
    {
      key: 'status', label: 'Durum', type: 'select', defaultValue: 'draft',
      options: [
        { value: 'draft', label: 'Taslak (yayında değil)' },
        { value: 'active', label: 'Yayında' },
        { value: 'published', label: 'Yayında (alternative)' },
        { value: 'archived', label: 'Arşivlenmiş' },
      ],
    },
  ];
}

export default function ProductsPage() {
  const crud = useAdminCrud({ endpoint: '/products', limit: 15, idField: 'product_id' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    // Brand listesi
    api
      .get<{ data: { brand_id: number; brand_name: string }[] }>('/brands?limit=500&sort=name', { token })
      .then((res) => {
        const rows = (res as any).data || (res as any);
        setBrands(
          rows
            .map((b: any) => ({ value: String(b.brand_id), label: b.brand_name }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label, 'tr')),
        );
      })
      .catch(() => setBrands([]));
    // Kategori tree -> flat
    api
      .get<any[]>('/categories/tree', { token })
      .then((tree) => {
        const flat: { value: string; label: string }[] = [];
        const walk = (n: any, depth = 0) => {
          flat.push({ value: String(n.category_id), label: `${'— '.repeat(depth)}${n.category_name}` });
          (n.children || []).forEach((c: any) => walk(c, depth + 1));
        };
        (tree as any[]).forEach((n) => walk(n));
        setCategories(flat);
      })
      .catch(() => setCategories([]));
  }, [token]);

  const formFields = useMemo(() => buildFormFields(brands, categories), [brands, categories]);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (row: any) => {
    // brand/category id'leri row.brand.brand_id'den cek (row'da sadece brand object var)
    const enriched = {
      ...row,
      brand_id: row.brand_id != null ? String(row.brand_id) : (row.brand?.brand_id != null ? String(row.brand.brand_id) : ''),
      category_id: row.category_id != null ? String(row.category_id) : (row.category?.category_id != null ? String(row.category.category_id) : ''),
    };
    setEditItem(enriched);
    setModalOpen(true);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    // brand_id ve category_id'yi number'a cevir
    const payload = {
      ...data,
      brand_id: data.brand_id ? Number(data.brand_id) : undefined,
      category_id: data.category_id ? Number(data.category_id) : undefined,
      net_content_value: data.net_content_value ? Number(data.net_content_value) : undefined,
    };
    if (editItem) {
      return crud.updateItem(editItem.product_id, payload);
    }
    return crud.createItem(payload);
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
