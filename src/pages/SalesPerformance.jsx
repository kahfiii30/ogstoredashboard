import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import PremiumTable from '../components/PremiumTable';
import MoneyText from '../components/MoneyText';
import ConfirmModal from '../components/ConfirmModal';
import ChartCard from '../components/ChartCard';
import CurrencyInput from '../components/CurrencyInput';
import { Users, TrendingUp, Award, UserPlus, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const SalesPerformance = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const salesPerformance = activeData.salesPerformance || [];

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    unit: '',
    profit: '',
    note: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const performanceData = {
      id: isEditing ? formData.id : Date.now().toString(),
      name: formData.name,
      unit: parseNumber(formData.unit),
      profit: parseNumber(formData.profit),
      note: formData.note,
      createdAt: isEditing ? formData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newData;
    if (isEditing) {
      newData = salesPerformance.map(s => s.id === formData.id ? performanceData : s);
      setIsEditing(false);
    } else {
      newData = [performanceData, ...salesPerformance];
    }
    
    updateActiveData('salesPerformance', newData);
    setFormData({ id: '', name: '', unit: '', profit: '', note: '' });
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setIsEditing(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newData = salesPerformance.filter(s => s.id !== itemToDelete.id);
      updateActiveData('salesPerformance', newData);
      setItemToDelete(null);
    }
  };

  // Calculations
  const totalUnit = salesPerformance.reduce((sum, s) => sum + Number(s.unit), 0);
  const totalProfit = salesPerformance.reduce((sum, s) => sum + Number(s.profit), 0);
  const avgProfitPerUnit = totalUnit > 0 ? Math.floor(totalProfit / totalUnit) : 0;

  // Best Sales
  const bestByUnit = [...salesPerformance].sort((a, b) => b.unit - a.unit)[0];
  const bestByProfit = [...salesPerformance].sort((a, b) => b.profit - a.profit)[0];

  // Ringkasan Utama (Tabel Utama)
  // Agregasi by name untuk handle case jika ada sales yang diinput 2x di hari yg sama
  const aggregatedDataMap = {};
  salesPerformance.forEach(s => {
    if (!aggregatedDataMap[s.name]) {
      aggregatedDataMap[s.name] = { name: s.name, unit: 0, profit: 0 };
    }
    aggregatedDataMap[s.name].unit += Number(s.unit);
    aggregatedDataMap[s.name].profit += Number(s.profit);
  });
  
  const aggregatedData = Object.values(aggregatedDataMap).sort((a, b) => b.profit - a.profit);
  
  const summaryTableData = [
    ...aggregatedData,
    { name: 'TOTAL', unit: totalUnit, profit: totalProfit, isTotal: true }
  ];

  // Chart Data
  const chartData = aggregatedData.map(d => ({
    name: d.name,
    Unit: d.unit,
    Profit: d.profit
  }));

  const mainColumns = [
    { header: 'Nama', accessor: 'name', render: (val, row) => <span className="font-semibold">{val}</span> },
    { header: 'Unit', accessor: 'unit', align: 'center' },
    { header: 'Profit', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
  ];

  const detailColumns = [
    { header: 'Nama', accessor: 'name', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
    { header: 'Unit', accessor: 'unit', align: 'center' },
    { header: 'Profit', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
    { header: 'Catatan', accessor: 'note', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
    { 
      header: 'Aksi', 
      accessor: 'id', 
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">Hapus</button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Performa Sales" 
        subtitle="Data performa sales berdasarkan tanggal aktif."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <SummaryCard 
          title="Total Unit Sales" 
          value={totalUnit} 
          icon={UserPlus} 
          isCurrency={false}
          color="blue"
        />
        <SummaryCard 
          title="Total Profit Sales" 
          value={totalProfit} 
          icon={TrendingUp} 
          color="emerald"
        />
        <SummaryCard 
          title="Avg Profit / Unit" 
          value={avgProfitPerUnit} 
          icon={FileSpreadsheet} 
          color="brand"
        />
        <SummaryCard 
          title="Unit Tertinggi" 
          value={bestByUnit ? bestByUnit.name : '-'} 
          icon={Award} 
          isCurrency={false}
          subtitle={bestByUnit ? `${bestByUnit.unit} Unit` : '-'}
          color="amber"
        />
        <SummaryCard 
          title="Profit Tertinggi" 
          value={bestByProfit ? bestByProfit.name : '-'} 
          icon={Users} 
          isCurrency={false}
          subtitle={bestByProfit ? formatRupiah(bestByProfit.profit) : '-'}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Grafik Unit per Sales">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="Unit" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grafik Profit per Sales">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `Rp${(value/1000000)}M`}
              />
              <Tooltip formatter={(value) => formatRupiah(value)} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title={isEditing ? 'Edit Performa Sales' : 'Tambah Sales'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sales</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Terjual</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profit (Rp)</label>
                <CurrencyInput 
                  className="input-field"
                  value={formData.profit}
                  onChange={e => setFormData({...formData, profit: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                <textarea 
                  className="input-field"
                  rows="2"
                  value={formData.note || ''}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {isEditing ? 'Simpan' : 'Tambah'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ id: '', name: '', unit: '', profit: '', note: '' });
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Ringkasan Utama">
            <PremiumTable 
              columns={mainColumns} 
              data={summaryTableData} 
              highlightTotalRow={true}
            />
          </SectionCard>

          <SectionCard title="Detail Data Sales">
            <PremiumTable 
              columns={detailColumns} 
              data={salesPerformance}
            />
          </SectionCard>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Data Sales"
        message="Apakah Anda yakin ingin menghapus catatan performa sales ini? Data yang dihapus tidak dapat dikembalikan."
      />
    </div>
  );
};

export default SalesPerformance;
