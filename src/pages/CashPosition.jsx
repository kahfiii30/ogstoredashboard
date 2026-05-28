import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotalUangAktif } from '../utils/calculations';
import { Banknote, Building2, Smartphone, Users } from 'lucide-react';

const CashPosition = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const cashPosition = activeData.cashPosition;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...cashPosition });

  useEffect(() => {
    setFormData(cashPosition);
    setIsEditing(false);
  }, [cashPosition]);

  const handleSave = () => {
    updateActiveData('cashPosition', {
      cash: parseNumber(formData.cash),
      bank: parseNumber(formData.bank),
      ewallet: parseNumber(formData.ewallet),
      piutang: parseNumber(formData.piutang),
    });
    setIsEditing(false);
  };

  const totalUangAktif = calculateTotalUangAktif(cashPosition);

  const items = [
    { key: 'cash', label: 'Cash Toko (Brankas)', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { key: 'bank', label: 'Saldo Bank', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { key: 'ewallet', label: 'E-Wallet (Ovo/Gopay/dll)', icon: Smartphone, color: 'text-violet-600', bg: 'bg-violet-100' },
    { key: 'piutang', label: 'Piutang Pending', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Posisi Uang Aktif</h1>
        <p className="text-slate-500">Pantau ketersediaan dana cair untuk operasional tanggal <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
      </div>

      <div className="card p-6 bg-emerald-50 border-emerald-200">
        <p className="text-sm font-medium text-emerald-600 mb-1">Total Uang Aktif</p>
        <h3 className="text-3xl font-bold text-emerald-900">{formatRupiah(totalUangAktif)}</h3>
      </div>

      <div className="card p-5 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Rincian Saldo</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
              Edit Saldo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {items.map((item) => (
            <div key={item.key} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${item.bg} mr-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-slate-600 text-sm">{item.label}</span>
              </div>
              
              <div className="mt-auto">
                {isEditing ? (
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                  />
                ) : (
                  <span className="font-bold text-xl text-slate-800">
                    {formatRupiah(cashPosition[item.key])}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={handleSave} className="btn-primary">Simpan Perubahan</button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...cashPosition });
              }} 
              className="btn-secondary"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashPosition;
