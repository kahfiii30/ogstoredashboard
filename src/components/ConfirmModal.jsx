import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Hapus", cancelText = "Batal", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={clsx(
              "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
              type === 'danger' ? "bg-red-100 text-red-600" : "bg-brand-100 text-brand-600"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1 pr-6">
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200/80 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={clsx(
              "px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md hover:shadow-lg outline-none",
              type === 'danger' 
                ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 focus:ring-4 focus:ring-red-500/30" 
                : "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:ring-4 focus:ring-brand-500/30"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
