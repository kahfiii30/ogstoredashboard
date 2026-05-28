import React from 'react';

const ChartCard = ({ title, children, subtitle }) => {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="w-full h-72">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
