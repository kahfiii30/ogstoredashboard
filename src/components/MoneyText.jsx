import React from 'react';
import clsx from 'clsx';
import { formatRupiah } from '../utils/format';

const MoneyText = ({ value, showColor = false, className }) => {
  const numValue = Number(value) || 0;
  
  const colorClass = showColor 
    ? (numValue > 0 ? 'text-emerald-600 dark:text-emerald-400' : numValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400')
    : 'text-slate-700 dark:text-slate-300';

  return (
    <span className={clsx("font-medium", colorClass, className)}>
      {formatRupiah(numValue)}
    </span>
  );
};

export default MoneyText;
