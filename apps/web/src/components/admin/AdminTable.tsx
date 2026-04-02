'use client';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export default function AdminTable({ columns, data, onEdit, onDelete }: AdminTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
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
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
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
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-400"
              >
                Veri bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
