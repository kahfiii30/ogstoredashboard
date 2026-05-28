import React from 'react';
import clsx from 'clsx';
import { Calendar } from 'lucide-react';

const FilterBar = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onQuickFilter,
  activeFilter
}) => {
  const quickFilters = [
    { id: 'today', label: 'Hari Ini' },
    { id: '7days', label: '7 Hari' },
    { id: '14days', label: '14 Hari' },
    { id: '30days', label: '30 Hari' }
  ];

  return (
    <div className="card p-4 md:p-5 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Periode:</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => onStartDateChange(e.target.value)}
            className="input-field py-2 text-sm max-w-[150px]"
          />
          <span className="text-slate-400 font-medium">-</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => onEndDateChange(e.target.value)}
            className="input-field py-2 text-sm max-w-[150px]"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onQuickFilter(filter.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border",
              activeFilter === filter.id 
                ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
