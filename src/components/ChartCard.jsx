import React from 'react';
import clsx from 'clsx';

const ChartCard = ({ title, children, subtitle, className, delayClass = '' }) => {
  return (
    <div className={clsx('card p-5 md:p-6 animate-fade-in-up group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-500', delayClass, className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-transform duration-300 group-hover:translate-x-1">{subtitle}</p>}
      </div>
      <div className="w-full h-72 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
