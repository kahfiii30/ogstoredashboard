import React, { useState, useEffect } from 'react';
import { useConfigData } from '../hooks/useSupabase';
import { formatRupiah, parseNumber } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AlertBox from '../components/AlertBox';
import ChartCard from '../components/ChartCard';
import { Loader2 } from 'lucide-react';

const StockAging = () => {
  const { data: stockAging, loading, updateData } = useConfigData('stock_aging', {
    '0-14': 0, '15-30': 0, '31-60': 0, '>60': 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...stockAging });

  // Sync formData when data loads
  useEffect(() => {
    setFormData(stockAging);
  }, [stockAging]);

  const handleSave = async () => {
    await updateData({
      '0-14': parseNumber(formData['0-14']),
      '15-30': parseNumber(formData['15-30']),
      '31-60': parseNumber(formData['31-60']),
      '>60': parseNumber(formData['>60']),
    });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  const isCritical = stockAging['>60'] > 300000000;

  const chartData = [
    { name: '0-14 Hari', value: stockAging['0-14'], color: '#10b981' },
    { name: '15-30 Hari', value: stockAging['15-30'], color: '#3b82f6' },
    { name: '31-60 Hari', value: stockAging['31-60'], color: '#f59e0b' },
    { name: '>60 Hari', value: stockAging['>60'], color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Stok Aging</h1>
        <p className="text-slate-500">Pantau umur stok untuk menjaga likuiditas.</p>
      </div>

      {isCritical && (
        <AlertBox 
          type="error" 
          title="Peringatan Kritis" 
          message={`Stok mati (>60 hari) telah mencapai ${formatRupiah(stockAging['>60'])}. Segera lakukan promosi, cuci gudang, atau retur ke distributor jika memungkinkan untuk menghindari beban arus kas.`}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Nilai Stok Aging</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                Edit Nilai
              </button>
            )}
          </div>

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
        </div>

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
