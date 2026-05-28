import React from 'react';
import clsx from 'clsx';

const SummaryCard = ({ title, value, icon: Icon, colorClass, subtitle }) => {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl flex-shrink-0', colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Decorative background element */}
      <div className={clsx(
        'absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 z-0',
        colorClass
      )}></div>
    </div>
  );
};

export default SummaryCard;
