import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CalendarDays, 
  Clock, 
  FileText, 
  Package, 
  Wallet, 
  BarChart3,
  Smartphone,
  Award
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/daily-sales', label: 'Penjualan Harian', icon: ShoppingCart },
  { path: '/sales-recap', label: 'Rekap 1–30 Hari', icon: CalendarDays },
  { path: '/stock-aging', label: 'Stok Aging', icon: Clock },
  { path: '/bills', label: 'Tagihan / Tempo', icon: FileText },
  { path: '/stock-condition', label: 'Kondisi Stok', icon: Package },
  { path: '/cash-position', label: 'Posisi Uang', icon: Wallet },
  { path: '/sales-performance', label: 'Performa Sales', icon: Award },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Smartphone className="w-6 h-6 text-brand-400 mr-2" />
        <span className="text-white font-bold text-lg tracking-wide">OG Dashboard</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className={clsx(
                  'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                )} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; {new Date().getFullYear()} OG Store
      </div>
    </div>
  );
};

export default Sidebar;
