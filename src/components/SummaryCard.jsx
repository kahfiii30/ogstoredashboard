import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatRupiah } from '../utils/format';

const SummaryCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  isCurrency = true, 
  color = 'brand',
  subtitle,
  className
}) => {
  
  const colorStyles = {
    brand: 'bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white',
    red: 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white',
    amber: 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white',
    purple: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white'
  };

  const getTrendStyle = (t) => {
    if (t > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (t < 0) return 'text-red-500 dark:text-red-400';
    return 'text-slate-400 dark:text-slate-500';
  };

  const getTrendIcon = (t) => {
    if (t > 0) return <ArrowUpRight className="w-3.5 h-3.5 mr-1 animate-bounce-slight" />;
    if (t < 0) return <ArrowDownRight className="w-3.5 h-3.5 mr-1" />;
    return null;
  };

  const formattedTrend = trend ? Math.abs(trend) : 0;
  
  return (
    <div className={clsx("card p-5 md:p-6 group relative overflow-hidden flex flex-col justify-between min-h-[140px]", className)}>
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <h3 className="font-semibold text-slate-500 dark:text-slate-400 text-sm md:text-base group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{title}</h3>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mt-2 transition-transform duration-300 group-hover:translate-x-1">
            {isCurrency ? formatRupiah(value) : value}
          </p>
        </div>
        
        {Icon && (
          <div className={clsx("p-3 rounded-2xl shadow-sm transition-all duration-300 flex-shrink-0", colorStyles[color] || colorStyles.brand)}>
            <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
      </div>
      
      <div className="mt-4 relative z-10">
        {trend !== undefined && trend !== 0 && (
          <div className={clsx("flex items-center text-xs md:text-sm font-medium transition-transform duration-300 group-hover:translate-x-1", getTrendStyle(trend))}>
            {getTrendIcon(trend)}
            <span>
              {trend > 0 ? 'Naik ' : 'Turun '}
              {isCurrency ? formatRupiah(formattedTrend) : formattedTrend}
              {trendLabel && <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-normal">{trendLabel}</span>}
            </span>
          </div>
        )}
        {subtitle && !trend && (
           <div className="text-xs md:text-sm text-slate-400 dark:text-slate-500 transition-transform duration-300 group-hover:translate-x-1">{subtitle}</div>
        )}
      </div>
      
      {/* Decorative animated gradient blur in background on hover */}
      <div className={clsx(
        "absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-all duration-700 ease-in-out group-hover:scale-150 z-0",
        color === 'brand' && "bg-brand-500",
        color === 'emerald' && "bg-emerald-500",
        color === 'red' && "bg-red-500",
        color === 'amber' && "bg-amber-500",
        color === 'blue' && "bg-blue-500",
        color === 'indigo' && "bg-indigo-500"
      )}></div>
    </div>
  );
};

export default SummaryCard;
