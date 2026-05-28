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
    const today = new Date().toISOString().split('T')[0];
    setActiveDate(today);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayOrFuture = activeDate >= todayStr;

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1.5">
      <div className="hidden sm:flex items-center px-3 border-r border-slate-100">
        <CalendarDays className="w-4 h-4 text-brand-500 mr-2" />
        <span className="text-sm font-semibold text-slate-600">Tanggal Aktif:</span>
      </div>
      
      <button 
        onClick={handlePrevDay}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        title="Hari Sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative">
        <input 
          type="date" 
          value={activeDate}
          max={todayStr}
          onChange={(e) => setActiveDate(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-sm font-bold text-slate-800 flex items-center justify-center min-w-[130px] border border-slate-200 group-hover:border-brand-300">
          {formatDate(activeDate)}
        </div>
      </div>

      <button 
        onClick={handleNextDay}
        disabled={isTodayOrFuture}
        className={`p-1.5 rounded-lg transition-colors ${
          isTodayOrFuture 
            ? 'text-slate-300 cursor-not-allowed' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
        title="Hari Berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button 
        onClick={handleToday}
        className="hidden sm:block ml-1 px-3 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold rounded-lg hover:bg-brand-100 transition-colors"
      >
        Hari Ini
      </button>

      {activeData?.meta?.createdFromDate && (
        <div className="absolute top-16 right-4 sm:right-20 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg shadow-sm animate-fade-in z-50 max-w-xs">
          <strong>Info:</strong> Data tanggal ini awalnya disalin dari tanggal {formatDate(activeData.meta.createdFromDate)}. Perubahan baru akan berdiri sendiri.
        </div>
      )}
    </div>
  );
};

export default ActiveDatePicker;
