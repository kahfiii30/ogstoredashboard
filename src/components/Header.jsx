import React from 'react';
import { Menu, Bell, UserCircle, LogOut } from 'lucide-react';
import { formatDate } from '../utils/format';
import ActiveDatePicker from './ActiveDatePicker';

const Header = () => {
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('og_auth');
      window.location.reload();
    }
  };

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6 md:px-8 z-20 flex-shrink-0 sticky top-0">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg mr-2 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        {/* Title is typically handled by PageHeader component on each page now */}
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-slate-400">Selamat datang kembali!</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        <ActiveDatePicker />
        
        <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors relative"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
