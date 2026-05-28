import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, color = 'slate' }) => {
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
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
