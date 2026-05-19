'use client';

/**
 * Generic admin table — T row tipini caller belirler.
 *
 * 2026-05-19 Madde 22 cleanup: any → generic. Default T = Record<string,unknown>
 * eski callsite'lar kırılmadan upgrade edilebilir.
 *
 * Kullanım:
 *   <AdminTable<MyRow> columns={...} data={rows} ... />
 *   Column<MyRow> sayesinde col.render satır tipini biliyor.
 */

/**
 * Column<T> — key generic'siz string kalıyor (eski callsite'lar 'kategori_slug'
 * gibi inline string geçiyor). value: any backward compat — eski render
 * callback'leri (v: string) gibi narrow imzayla çalışsın.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  meta?: PaginationMeta;
  page?: number;
  onPageChange?: (page: number) => void;
  search?: string;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export default function AdminTable<T extends object = Record<string, unknown>>({
  columns,
  data,
  loading,
  meta,
  page = 1,
  onPageChange,
  search,
  onSearch,
  searchPlaceholder = 'Ara...',
  onEdit,
  onDelete,
}: AdminTableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search bar */}
      {onSearch && (
        <div className="px-4 pt-4">
          <input
            type="text"
            value={search || ''}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}

      {/* Info bar */}
      {meta && (
        <div className="px-4 py-2 text-xs text-gray-400">
          Toplam {meta.total} kayıt
          {meta.totalPages > 1 && ` — Sayfa ${meta.page}/${meta.totalPages}`}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  İşlemler
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  Yükleniyor...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  Veri bulunamadı
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key];
                    return (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(value, row) : ((value as React.ReactNode) ?? '-')}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Düzenle
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Sil
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded text-xs border disabled:opacity-30 hover:bg-gray-50"
          >
            Önceki
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (meta.totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= meta.totalPages - 3) {
                pageNum = meta.totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded text-xs ${
                    pageNum === page ? 'bg-primary text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= meta.totalPages}
            className="px-3 py-1 rounded text-xs border disabled:opacity-30 hover:bg-gray-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
