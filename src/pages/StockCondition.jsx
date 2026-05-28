import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotalStok } from '../utils/calculations';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import { Package } from 'lucide-react';
import ChartCard from '../components/ChartCard';

const COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b']; // teal, sky, amber

const StockCondition = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const stockCondition = activeData.stockCondition;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...stockCondition });

  useEffect(() => {
    setFormData(stockCondition);
    setIsEditing(false);
  }, [stockCondition]);

  const handleSave = () => {
    updateActiveData('stockCondition', {
      hpBaru: parseNumber(formData.hpBaru),
      hpSecond: parseNumber(formData.hpSecond),
    });
    setIsEditing(false);
  };

  const totalStok = calculateTotalStok(stockCondition);

  const pieData = [
    { name: 'HP Baru', value: stockCondition.hpBaru || 0 },
    { name: 'HP Second', value: stockCondition.hpSecond || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Kondisi Stok" 
        subtitle="Total nilai inventaris toko."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`}
      />

      <div className="max-w-md">
        <SummaryCard 
          title="Total Nilai Stok Keseluruhan" 
          value={totalStok} 
          icon={Package} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Nilai Stok per Kategori"
          action={
            !isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                Edit Nilai
              </button>
            )
          }
        >
          <div className="space-y-5">
            {['hpBaru', 'hpSecond'].map((key) => {
              const labels = {
                hpBaru: 'HP Baru',
                hpSecond: 'HP Second',
              };
              
              const icons = {
                hpBaru: '📦',
                hpSecond: '🔄',
              };

              return (
                <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center mb-3 md:mb-0">
                    <span className="text-2xl mr-3">{icons[key]}</span>
                    <span className="font-medium text-slate-700">{labels[key]}</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      className="input-field max-w-[250px]"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    />
                  ) : (
                    <span className="font-bold text-xl text-slate-800">
                      {formatRupiah(stockCondition[key] || 0)}
                    </span>
                  )}
                </div>
              );
            })}

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={handleSave} className="btn-primary flex-1">Simpan Perubahan</button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ ...stockCondition });
                  }} 
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        <ChartCard title="Komposisi Stok">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default StockCondition;
