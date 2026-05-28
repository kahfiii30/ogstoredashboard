import React from 'react';
import clsx from 'clsx';
import { formatRupiah } from '../utils/format';

const MoneyText = ({ value, showColor = false, className }) => {
  const numValue = Number(value) || 0;
  
  const colorClass = showColor 
    ? (numValue > 0 ? 'text-emerald-600' : numValue < 0 ? 'text-red-600' : 'text-slate-600')
    : 'text-slate-700';

  return (
    <span className={clsx("font-medium", colorClass, className)}>
      {formatRupiah(numValue)}
    </span>
  );
};

export default MoneyText;
