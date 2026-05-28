import React, { useState } from 'react';
import { useSales } from '../hooks/useSupabase';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotal } from '../utils/calculations';
import DataTable from '../components/DataTable';
import { Loader2, Calendar } from 'lucide-react';

const DailySales = () => {
  const { sales, loading, addSale, updateSale, deleteSale } = useSales();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeDate, setActiveDate] = useState(todayStr);
  
  const [formData, setFormData] = useState({
    id: '',
    date: todayStr,
    category: 'HP Baru',
    units: '',
    omzet: '',
    profit: '',
    notes: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  // When activeDate changes, update formData date if we are not editing
  const handleDateChange = (newDate) => {
    setActiveDate(newDate);
    if (!isEditing) {
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saleData = {
      date: formData.date,
      category: formData.category,
      units: parseNumber(formData.units),
      omzet: parseNumber(formData.omzet),
      profit: parseNumber(formData.profit),
      notes: formData.notes
    };

    if (isEditing) {
      await updateSale(formData.id, saleData);
      setIsEditing(false);
    } else {
      await addSale(saleData);
    }
    
    // Reset form except date
    setFormData({
      id: '',
      date: formData.date, // keep the date that was just submitted
      category: 'HP Baru',
      units: '',
      omzet: '',
      profit: '',
      notes: ''
    });
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setIsEditing(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      await deleteSale(row.id);
    }
  };

  // Filter sales based on activeDate
  const activeDateSales = sales.filter(s => s.date === activeDate);
  const totalOmzet = calculateTotal(activeDateSales, 'omzet');
  const totalProfit = calculateTotal(activeDateSales, 'profit');
  const totalUnits = calculateTotal(activeDateSales, 'units');

  const columns = [
    { header: 'Kategori', accessor: 'category', render: (val) => (
      <span className="font-medium text-slate-700">{val}</span>
    )},
    { header: 'Unit', accessor: 'units' },
    { header: 'Omzet', accessor: 'omzet', render: (val) => <span className="text-brand-600">{formatRupiah(val)}</span> },
    { header: 'Profit', accessor: 'profit', render: (val) => <span className="text-emerald-600">{formatRupiah(val)}</span> },
    { header: 'Catatan', accessor: 'notes', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Penjualan Harian</h1>
          <p className="text-slate-500">Catat dan kelola transaksi harian toko.</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-400 mx-2" />
          <input 
            type="date" 
            className="border-none focus:ring-0 text-sm font-semibold text-slate-700 bg-transparent cursor-pointer"
            value={activeDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-brand-50 border-brand-200">
          <p className="text-sm font-medium text-brand-600 mb-1">Total Omzet ({formatDate(activeDate)})</p>
          <h3 className="text-2xl font-bold text-brand-900">{formatRupiah(totalOmzet)}</h3>
        </div>
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-medium text-emerald-600 mb-1">Total Profit ({formatDate(activeDate)})</p>
          <h3 className="text-2xl font-bold text-emerald-900">{formatRupiah(totalProfit)}</h3>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-600 mb-1">Total Unit Terjual ({formatDate(activeDate)})</p>
          <h3 className="text-2xl font-bold text-blue-900">{totalUnits}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditing ? 'Edit Penjualan' : 'Tambah Penjualan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  className="input-field bg-slate-50 text-slate-500" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="HP Baru">HP Baru</option>
                  <option value="HP Second">HP Second</option>
                  <option value="Aksesoris">Aksesoris</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Terjual</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={formData.units}
                  onChange={e => setFormData({...formData, units: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Omzet (Rp)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={formData.omzet}
                  onChange={e => setFormData({...formData, omzet: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profit Kotor (Rp)</label>
                <input 
                  type="number" 
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
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Contoh: Seri HP, Aksesoris..."
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Data'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        id: '', date: activeDate, category: 'HP Baru', units: '', omzet: '', profit: '', notes: ''
                      });
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Riwayat Penjualan</h3>
              <span className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                {formatDate(activeDate)}
              </span>
            </div>
            
            <DataTable 
              columns={columns} 
              data={activeDateSales}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySales;
