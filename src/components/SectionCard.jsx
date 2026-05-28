import React from 'react';
import clsx from 'clsx';

const SectionCard = ({ title, children, className, action, delayClass = '' }) => {
  return (
    <div className={clsx('card p-5 md:p-6 animate-fade-in-up group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-500', delayClass, className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">{title}</h3>}
          {action && <div className="transition-transform duration-300 group-hover:translate-x-1">{action}</div>}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SectionCard;
