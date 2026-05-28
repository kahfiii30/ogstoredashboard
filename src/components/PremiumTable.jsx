import React from 'react';
import clsx from 'clsx';
import EmptyState from './EmptyState';

const PremiumTable = ({ columns, data, emptyMessage = "Belum ada data", highlightTotalRow = false }) => {
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6 pb-2">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={clsx(
                  "py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50/50 first:rounded-tl-lg last:rounded-tr-lg",
                  col.align === 'right' && "text-right",
                  col.align === 'center' && "text-center"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const isTotalRow = highlightTotalRow && rowIndex === data.length - 1;
            return (
              <tr 
                key={rowIndex} 
                className={clsx(
                  "border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors group",
                  isTotalRow && "bg-brand-50/50 hover:bg-brand-50 font-semibold"
                )}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={clsx(
                      "py-4 px-4 text-sm align-middle whitespace-nowrap",
                      col.align === 'right' && "text-right",
                      col.align === 'center' && "text-center",
                      isTotalRow ? "text-brand-900" : "text-slate-700"
                    )}
                  >
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PremiumTable;
