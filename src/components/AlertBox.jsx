import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

const AlertBox = ({ type = 'info', title, message }) => {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    }
  };

  const selectedStyle = styles[type] || styles.info;

  return (
    <div className={clsx('border rounded-xl p-4 flex items-start shadow-sm', selectedStyle.container)}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {selectedStyle.icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
};

export default AlertBox;
