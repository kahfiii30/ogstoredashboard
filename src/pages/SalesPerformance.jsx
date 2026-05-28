import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import ChartCard from '../components/ChartCard';
import SummaryCard from '../components/SummaryCard';
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
    { header: 'Nama', accessor: 'name', render: (val, row) => <span className={row.isTotal ? "font-bold" : "font-medium text-slate-700"}>{val}</span> },
    { header: 'Unit', accessor: 'unit', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg" : ""}>{val}</span> },
    { header: 'Profit', accessor: 'profit', render: (val, row) => <span className={clsx(row.isTotal ? "font-bold text-lg text-emerald-700" : "text-emerald-600 font-medium")}>{formatRupiah(val)}</span> },
  ];

  const detailColumns = [
    { header: 'Nama', accessor: 'name', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Profit', accessor: 'profit', render: (val) => <span className="text-emerald-600 font-medium">{formatRupiah(val)}</span> },
    { header: 'Catatan', accessor: 'note', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Performa Sales</h1>
        <p className="text-slate-500">Data performa sales berdasarkan tanggal aktif <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard 
          title="Total Unit Sales" 
          value={totalUnit} 
          icon={UserPlus} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <SummaryCard 
          title="Total Profit Sales" 
          value={formatRupiah(totalProfit)} 
          icon={TrendingUp} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SummaryCard 
          title="Avg Profit / Unit" 
          value={formatRupiah(avgProfitPerUnit)} 
          icon={FileSpreadsheet} 
          colorClass="bg-teal-100 text-teal-600"
        />
        <div className="card p-4 bg-white border-amber-100 hover:border-amber-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600 text-sm">Unit Tertinggi</h3>
          </div>
          <p className="text-xl font-bold text-slate-800 truncate">{bestByUnit ? bestByUnit.name : '-'}</p>
          <p className="text-xs text-slate-500 mt-1">{bestByUnit ? `${bestByUnit.unit} Unit` : '-'}</p>
        </div>
        <div className="card p-4 bg-white border-brand-100 hover:border-brand-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600 text-sm">Profit Tertinggi</h3>
          </div>
          <p className="text-xl font-bold text-slate-800 truncate">{bestByProfit ? bestByProfit.name : '-'}</p>
          <p className="text-xs text-slate-500 mt-1">{bestByProfit ? formatRupiah(bestByProfit.profit) : '-'}</p>
        </div>
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
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditing ? 'Edit Performa Sales' : 'Tambah Sales'}
            </h3>
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
                <input 
                  type="number" 
                  min="0"
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
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Utama</h3>
            <DataTable 
              columns={mainColumns} 
              data={summaryTableData} 
              keyField="name" 
              getRowClass={(row) => row.isTotal ? "bg-emerald-50 hover:bg-emerald-100" : ""}
            />
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Detail Data Sales</h3>
            <DataTable 
              columns={detailColumns} 
              data={salesPerformance}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
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
