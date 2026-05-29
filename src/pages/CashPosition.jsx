import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotalUangAktif } from '../utils/calculations';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import CurrencyInput from '../components/CurrencyInput';
import { Banknote, Building2, Smartphone, Users, Wallet } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Posisi Uang Aktif" 
        subtitle="Pantau ketersediaan dana cair untuk operasional."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`}
      />

      <div className="max-w-md">
        <SummaryCard 
          title="Total Uang Aktif" 
          value={totalUangAktif} 
          icon={Wallet} 
          color="emerald" 
        />
      </div>

      <SectionCard 
        title="Rincian Saldo"
        action={
          !isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
              Edit Saldo
            </button>
          )
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {items.map((item) => (
            <div key={item.key} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col hover:border-brand-200 transition-colors">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-xl ${item.bg} mr-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-semibold text-slate-600">{item.label}</span>
              </div>
              
              <div className="mt-auto">
                {isEditing ? (
                  <CurrencyInput
                    className="input-field w-full"
                    value={formData[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                  />
                ) : (
                  <span className="font-bold text-2xl text-slate-800 tracking-tight">
                    {formatRupiah(cashPosition[item.key])}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-5 border-t border-slate-100">
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
      </SectionCard>
    </div>
  );
};

export default CashPosition;
