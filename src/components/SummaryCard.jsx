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
  variant = 'default', // 'default' | 'compact'
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
    if (t > 0) return <ArrowUpRight className="w-3.5 h-3.5 mr-1" />;
    if (t < 0) return <ArrowDownRight className="w-3.5 h-3.5 mr-1" />;
    return null;
  };

  const formattedTrend = trend ? Math.abs(trend) : 0;
  
  return (
    <div className={clsx("card p-5 md:p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]", className)}>
      {variant === 'compact' ? (
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="font-semibold text-slate-500 dark:text-slate-400 text-sm md:text-base transition-colors leading-tight">
              {title}
            </h3>
            {Icon && (
              <div className={clsx("p-1.5 md:p-2 rounded-lg flex-shrink-0", colorStyles[color] || colorStyles.brand)}>
                <Icon className="w-4 h-4 md:w-4 md:h-4" />
              </div>
            )}
          </div>
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300 break-words leading-tight">
            {isCurrency ? formatRupiah(value) : value}
          </p>
        </div>
      ) : (
        <div className="flex justify-between items-start relative z-10 w-full">
          <div className="flex flex-col min-w-0 pr-2 w-full">
            <h3 className="font-semibold text-slate-500 dark:text-slate-400 text-sm md:text-base transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mt-1 transition-colors duration-300 break-words leading-tight">
              {isCurrency ? formatRupiah(value) : value}
            </p>
          </div>
          
          {Icon && (
            <div className={clsx("p-2.5 md:p-3 rounded-2xl shadow-sm flex-shrink-0", colorStyles[color] || colorStyles.brand)}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          )}
        </div>
      )}
      
      {(trend !== undefined || subtitle) && (
        <div className="mt-4 relative z-10 w-full">
          {trend !== undefined && trend !== 0 && (
            <div className={clsx("flex items-center text-xs md:text-sm font-medium transition-colors duration-300", getTrendStyle(trend))}>
              {getTrendIcon(trend)}
              <span>
                {trend > 0 ? 'Naik ' : 'Turun '}
                {isCurrency ? formatRupiah(formattedTrend) : formattedTrend}
                {trendLabel && <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-normal">{trendLabel}</span>}
              </span>
            </div>
          )}
          {subtitle && !trend && (
             <div className="text-xs md:text-sm text-slate-400 dark:text-slate-500 transition-colors duration-300">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
