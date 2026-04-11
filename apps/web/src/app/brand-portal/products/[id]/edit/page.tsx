'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ProductDetail {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description?: string;
  target_gender?: string;
  net_content_value?: number;
  net_content_unit?: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    short_description: '',
    usage_instructions: '',
    ph_value: '',
    formulation_type: '',
    preservative_system: '',
    fragrance_type: '',
    target_skin_types: '',
    manufacturing_country: '',
    concentration_data: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('brand_token');
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }

    // Fetch product details from the public products API
    fetch(`${API_URL}/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setForm((prev) => ({
          ...prev,
          short_description: data.short_description || '',
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('brand_token');
    // Only send non-empty fields
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(form)) {
      if (value.trim()) {
        payload[key] = value;
      }
    }

    if (Object.keys(payload).length === 0) {
      setMessage('En az bir alanı doldurun.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/brand-portal/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Güncelleme hatası');
      }

      const data = await res.json();
      setMessage(`${data.pending_edits} alan güncelleme isteği oluşturuldu. Admin onayı bekleniyor.`);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            {product?.product_name || 'Ürün'}
          </h1>
          <p className="text-sm text-on-surface-variant">Bilgi güncelleme isteği oluştur</p>
        </div>
      </div>

      {message && (
        <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Temel Bilgiler */}
        <Section title="Temel Bilgiler" icon="info">
          <Field
            label="Kısa Açıklama"
            value={form.short_description}
            onChange={(v) => updateField('short_description', v)}
            multiline
            placeholder="Ürün hakkında kısa açıklama (160 karakter)"
          />
          <Field
            label="Kullanım Talimatı"
            value={form.usage_instructions}
            onChange={(v) => updateField('usage_instructions', v)}
            multiline
            placeholder="Temiz cilde, sabah ve akşam uygulayın..."
          />
          <Field
            label="Hedef Cilt Tipi"
            value={form.target_skin_types}
            onChange={(v) => updateField('target_skin_types', v)}
            placeholder="Hassas, Kuru, Karma"
          />
        </Section>

        {/* Section 2: İçerik Şeffaflığı */}
        <Section title="İçerik Şeffaflığı" icon="science">
          <Field
            label="Aktif Madde Konsantrasyonları"
            value={form.concentration_data}
            onChange={(v) => updateField('concentration_data', v)}
            multiline
            placeholder="Niacinamide: %5, Ceramide NP: %0.05, Madecassoside: %0.1"
          />
          <p className="text-xs text-on-surface-variant -mt-2">
            Konsantrasyon paylaşan markalar ortalama %23 daha fazla kullanıcı güveni kazanıyor.
          </p>
          <Field
            label="pH Değeri"
            value={form.ph_value}
            onChange={(v) => updateField('ph_value', v)}
            placeholder="5.5"
          />
          <Field
            label="Formülasyon Tipi"
            value={form.formulation_type}
            onChange={(v) => updateField('formulation_type', v)}
            placeholder="Su bazlı, Emülsiyon, Yağ bazlı, Jel"
          />
          <Field
            label="Koruyucu Sistemi"
            value={form.preservative_system}
            onChange={(v) => updateField('preservative_system', v)}
            placeholder="Phenoxyethanol + Ethylhexylglycerin"
          />
          <Field
            label="Parfüm/Koku"
            value={form.fragrance_type}
            onChange={(v) => updateField('fragrance_type', v)}
            placeholder="Parfümsüz, Sentetik parfüm, Doğal esans"
          />
        </Section>

        {/* Section 3: Üretim */}
        <Section title="Üretim & Kalite" icon="factory">
          <Field
            label="Üretim Ülkesi"
            value={form.manufacturing_country}
            onChange={(v) => updateField('manufacturing_country', v)}
            placeholder="Güney Kore"
          />
        </Section>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
          >
            {saving ? 'Gönderiliyor...' : 'Güncelleme İsteği Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    'w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none';

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
