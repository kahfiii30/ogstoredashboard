import React from 'react';
import { Menu, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ActiveDatePicker from './ActiveDatePicker';

const Header = () => {
  const { theme, toggleTheme } = useApp();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('og_auth');
      window.location.reload();
    }
  };

  return (
    <header className="h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between px-6 md:px-8 z-20 flex-shrink-0 sticky top-0 transition-colors duration-500">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        {/* Title is typically handled by PageHeader component on each page now */}
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Selamat datang kembali!</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <ActiveDatePicker />
        
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-full transition-colors relative"
          title={theme === 'dark' ? 'Ganti ke Terang' : 'Ganti ke Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors relative"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
