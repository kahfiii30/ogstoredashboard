import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const DataTable = ({ columns, data, onEdit, onDelete, keyField = 'id', getRowClass }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3">
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-8 text-center text-slate-500">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowClass = getRowClass ? getRowClass(row) : '';
              return (
                <tr key={row[keyField]} className={clsx("transition-colors", rowClass || "hover:bg-slate-50")}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-slate-700">
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
