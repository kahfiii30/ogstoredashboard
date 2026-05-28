import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ message = "Tidak ada data untuk ditampilkan", icon = FileQuestion }) => {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-slate-800 font-medium mb-1">Data Kosong</h4>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;
