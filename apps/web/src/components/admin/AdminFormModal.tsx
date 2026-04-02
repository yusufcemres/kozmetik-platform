'use client';

import { useState, useEffect } from 'react';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

interface AdminFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<boolean>;
  title: string;
  fields: FormField[];
  initialData?: Record<string, any> | null;
  submitLabel?: string;
}

export default function AdminFormModal({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  initialData,
  submitLabel,
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        if (initialData && initialData[f.key] !== undefined) {
          initial[f.key] = initialData[f.key];
        } else if (f.defaultValue !== undefined) {
          initial[f.key] = f.defaultValue;
        } else if (f.type === 'checkbox') {
          initial[f.key] = false;
        } else if (f.type === 'number') {
          initial[f.key] = '';
        } else {
          initial[f.key] = '';
        }
      });
      setFormData(initial);
    }
  }, [open, initialData, fields]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await onSubmit(formData);
    setSubmitting(false);
    if (success) onClose();
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  required={field.required}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="">Seçiniz...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[field.key]}
                    onChange={(e) => updateField(field.key, e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/30"
                  />
                  <span className="text-sm text-gray-600">{field.placeholder || 'Evet'}</span>
                </label>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] ?? ''}
                  onChange={(e) =>
                    updateField(
                      field.key,
                      field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                    )
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : (submitLabel || (initialData ? 'Güncelle' : 'Oluştur'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
