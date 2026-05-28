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
    <div className="w-[260px] bg-slate-900 bg-gradient-to-b from-[#0F172A] to-[#1e293b] text-slate-300 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 shadow-2xl relative z-30">
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] mr-3">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OG Dashboard</span>
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
                  'flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden',
                  isActive 
                    ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:shadow-sm'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx(
                      'w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-brand-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'text-slate-500 group-hover:text-slate-300'
                    )} />
                    {item.label}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
                    )}
                  </>
                )}
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
