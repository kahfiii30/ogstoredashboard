import React from 'react';

const PageHeader = ({ title, subtitle, dateLabel }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 mt-1.5 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {dateLabel && (
          <div className="inline-flex items-center px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium border border-brand-100/50">
            {dateLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
