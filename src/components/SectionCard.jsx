import React from 'react';
import clsx from 'clsx';

const SectionCard = ({ title, children, className, action }) => {
  return (
    <div className={clsx('card p-5 md:p-6', className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {title && <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default SectionCard;
