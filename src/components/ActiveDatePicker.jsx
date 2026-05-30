import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { formatDate } from '../utils/format';

const ActiveDatePicker = () => {
  const { activeDate, setActiveDate, activeData } = useApp();

  const handlePrevDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const maxDateStr = d.toISOString().split('T')[0];
    setActiveDate(maxDateStr);
  };

  const maxDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();
  
  const isTodayOrFuture = activeDate >= maxDateStr;

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 transition-colors">
      <div className="hidden sm:flex items-center px-3 border-r border-slate-100 dark:border-slate-700">
        <CalendarDays className="w-4 h-4 text-brand-500 dark:text-brand-400 mr-2" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal Aktif:</span>
      </div>
      
      <button 
        onClick={handlePrevDay}
        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        title="Hari Sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative group cursor-pointer" onClick={() => {
        const input = document.getElementById('hidden-date-input');
        if (input && input.showPicker) {
          try {
            input.showPicker();
          } catch (e) {}
        }
      }}>
        <input 
          id="hidden-date-input"
          type="date" 
          value={activeDate}
          max={maxDateStr}
          onChange={(e) => setActiveDate(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center min-w-[130px] border border-slate-200 dark:border-slate-700 group-hover:border-brand-300 dark:group-hover:border-brand-500 transition-colors pointer-events-none">
          {formatDate(activeDate)}
        </div>
      </div>

      <button 
        onClick={handleNextDay}
        disabled={isTodayOrFuture}
        className={`p-1.5 rounded-lg transition-colors ${
          isTodayOrFuture 
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100'
        }`}
        title="Hari Berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button 
        onClick={handleToday}
        className="hidden sm:block ml-1 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-lg hover:bg-brand-100 dark:hover:bg-brand-800/50 transition-colors"
      >
        Hari Ini
      </button>

      {activeData?.meta?.createdFromDate && (
        <div className="absolute top-16 right-4 sm:right-20 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs px-3 py-2 rounded-lg shadow-sm animate-fade-in z-50 max-w-xs">
          <strong>Info:</strong> Data tanggal ini awalnya disalin dari tanggal {formatDate(activeData.meta.createdFromDate)}. Perubahan baru akan berdiri sendiri.
        </div>
      )}
    </div>
  );
};

export default ActiveDatePicker;
