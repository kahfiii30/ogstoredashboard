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
  subtitle
}) => {
  
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const getTrendStyle = (t) => {
    if (t > 0) return 'text-emerald-600';
    if (t < 0) return 'text-red-500';
    return 'text-slate-400';
  };

  const getTrendIcon = (t) => {
    if (t > 0) return <ArrowUpRight className="w-3.5 h-3.5 mr-1" />;
    if (t < 0) return <ArrowDownRight className="w-3.5 h-3.5 mr-1" />;
    return null;
  };

  const formattedTrend = trend ? Math.abs(trend) : 0;
  
  return (
    <div className="card p-5 md:p-6 group relative">
      <div className="flex items-center gap-3.5 mb-3">
        {Icon && (
          <div className={clsx("p-2.5 rounded-xl shadow-sm", colorStyles[color] || colorStyles.brand)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <h3 className="font-semibold text-slate-500 text-sm">{title}</h3>
      </div>
      
      <div className="mt-1">
        <p className="text-2xl font-bold text-slate-800 tracking-tight z-10 relative">
          {isCurrency ? formatRupiah(value) : value}
        </p>
        
        {trend !== undefined && trend !== 0 && (
          <div className={clsx("flex items-center text-xs mt-2.5 font-medium z-10 relative", getTrendStyle(trend))}>
            {getTrendIcon(trend)}
            <span>
              {trend > 0 ? 'Naik ' : 'Turun '}
              {isCurrency ? formatRupiah(formattedTrend) : formattedTrend}
              {trendLabel && <span className="text-slate-400 ml-1.5 font-normal">{trendLabel}</span>}
            </span>
          </div>
        )}
        {subtitle && !trend && (
           <div className="text-xs text-slate-400 mt-2.5 z-10 relative">{subtitle}</div>
        )}
      </div>
      
      {/* Decorative gradient blur in background on hover */}
      <div className={clsx(
        "absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-0",
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
