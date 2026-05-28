import React, { useState, useEffect } from 'react';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import AlertBox from '../components/AlertBox';
import ChartCard from '../components/ChartCard';
import { Clock, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

const StockAging = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const stockAging = activeData.stockAging;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...stockAging });

  // Sync formData when date changes
  useEffect(() => {
    setFormData(stockAging);
    setIsEditing(false);
  }, [stockAging]);

  const handleSave = () => {
    updateActiveData('stockAging', {
      '0-14': parseNumber(formData['0-14']),
      '15-30': parseNumber(formData['15-30']),
      '31-60': parseNumber(formData['31-60']),
      '>60': parseNumber(formData['>60']),
    });
    setIsEditing(false);
  };

  const isCritical = stockAging['>60'] > 300000000;

  const chartData = [
    { name: '0-14 Hari', value: stockAging['0-14'], color: '#10b981' },
    { name: '15-30 Hari', value: stockAging['15-30'], color: '#3b82f6' },
    { name: '31-60 Hari', value: stockAging['31-60'], color: '#f59e0b' },
    { name: '>60 Hari', value: stockAging['>60'], color: '#ef4444' },
  ];

  const totalAging = Object.values(stockAging).reduce((sum, val) => sum + Number(val), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Stok Aging" 
        subtitle="Pantau umur stok untuk menjaga likuiditas."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`}
      />

      {isCritical && (
        <AlertBox 
          type="error" 
          title="Peringatan Kritis" 
          message={`Stok mati (>60 hari) telah mencapai ${formatRupiah(stockAging['>60'])}. Segera lakukan promosi, cuci gudang, atau retur ke distributor jika memungkinkan untuk menghindari beban arus kas.`}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
        <SummaryCard 
          title="Total Stok Aging" 
          value={totalAging} 
          icon={Clock} 
          color="brand" 
        />
        <SummaryCard 
          title="0-14 Hari" 
          value={stockAging['0-14']} 
          icon={CheckCircle} 
          color="emerald" 
        />
        <SummaryCard 
          title="15-30 Hari" 
          value={stockAging['15-30']} 
          icon={Clock} 
          color="blue" 
        />
        <SummaryCard 
          title="31-60 Hari" 
          value={stockAging['31-60']} 
          icon={AlertTriangle} 
          color="amber" 
        />
        <SummaryCard 
          title=">60 Hari" 
          value={stockAging['>60']} 
          icon={AlertOctagon} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Nilai Stok Aging"
          action={
            !isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                Edit Nilai
              </button>
            )
          }
        >

          <div className="space-y-4">
            {Object.keys(stockAging).map((key) => {
              const labels = {
                '0-14': '0 - 14 Hari (Lancar)',
                '15-30': '15 - 30 Hari (Menengah)',
                '31-60': '31 - 60 Hari (Lambat)',
                '>60': '> 60 Hari (Mati / Dead Stock)',
              };

              return (
                <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700 mb-2 md:mb-0">{labels[key]}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      className="input-field max-w-[200px]"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    />
                  ) : (
                    <span className={`font-bold text-lg ${key === '>60' && isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatRupiah(stockAging[key])}
                    </span>
                  )}
                </div>
              );
            })}

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="btn-primary flex-1">Simpan</button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ ...stockAging });
                  }} 
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        <ChartCard title="Grafik Umur Stok">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `Rp${(value/1000000)}M`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={100}
              />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default StockAging;
