import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, color = 'slate' }) => {
  const colorStyles = {
    brand: 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-500/30',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    red: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  };

  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      colorStyles[color] || colorStyles.slate
    )}>
      {children}
    </span>
  );
};

export default Badge;
