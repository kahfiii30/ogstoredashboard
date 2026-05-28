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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg mr-2">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Overview</h2>
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
