import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotalStok } from '../utils/calculations';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      aksesoris: parseNumber(formData.aksesoris),
    });
    setIsEditing(false);
  };

  const totalStok = calculateTotalStok(stockCondition);

  const pieData = [
    { name: 'HP Baru', value: stockCondition.hpBaru },
    { name: 'HP Second', value: stockCondition.hpSecond },
    { name: 'Aksesoris', value: stockCondition.aksesoris },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kondisi Stok</h1>
        <p className="text-slate-500">Total nilai inventaris toko untuk tanggal <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
      </div>

      <div className="card p-6 bg-indigo-50 border-indigo-200">
        <p className="text-sm font-medium text-indigo-600 mb-1">Total Nilai Stok Keseluruhan</p>
        <h3 className="text-3xl font-bold text-indigo-900">{formatRupiah(totalStok)}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Nilai Stok per Kategori</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                Edit Nilai
              </button>
            )}
          </div>

          <div className="space-y-5">
            {Object.keys(stockCondition).map((key) => {
              const labels = {
                hpBaru: 'HP Baru',
                hpSecond: 'HP Second',
                aksesoris: 'Aksesoris'
              };
              
              const icons = {
                hpBaru: '📦',
                hpSecond: '🔄',
                aksesoris: '🎧'
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
                      {formatRupiah(stockCondition[key])}
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
        </div>

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
