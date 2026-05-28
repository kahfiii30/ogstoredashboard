import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotal } from '../utils/calculations';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';

const DailySales = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const sales = activeData.sales || [];
  
  const [formData, setFormData] = useState({
    id: '',
    category: 'HP Baru',
    units: '',
    omzet: '',
    hpp: '',
    notes: ''
  });

  const calculatedProfit = useMemo(() => {
    const o = parseNumber(formData.omzet);
    const h = parseNumber(formData.hpp);
    return o - h;
  }, [formData.omzet, formData.hpp]);

  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleCurrencyChange = (field, value) => {
    const rawValue = value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setFormData({ ...formData, [field]: '' });
      return;
    }
    const formatted = 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(rawValue, 10));
    setFormData({ ...formData, [field]: formatted });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const saleData = {
      id: isEditing ? formData.id : Date.now().toString(),
      date: activeDate,
      category: formData.category,
      units: parseNumber(formData.units),
      omzet: parseNumber(formData.omzet),
      hpp: parseNumber(formData.hpp),
      profit: calculatedProfit,
      notes: formData.notes
    };

    let newSales;
    if (isEditing) {
      newSales = sales.map(s => s.id === formData.id ? saleData : s);
      setIsEditing(false);
    } else {
      newSales = [saleData, ...sales];
    }
    
    updateActiveData('sales', newSales);
    
    setFormData({ id: '', category: 'HP Baru', units: '', omzet: '', hpp: '', notes: '' });
  };

  const handleEdit = (row) => {
    const hppVal = row.hpp !== undefined ? row.hpp : (row.omzet - row.profit);
    setFormData({ 
      ...row, 
      omzet: 'Rp ' + new Intl.NumberFormat('id-ID').format(row.omzet),
      hpp: 'Rp ' + new Intl.NumberFormat('id-ID').format(hppVal) 
    });
    setIsEditing(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newSales = sales.filter(s => s.id !== itemToDelete.id);
      updateActiveData('sales', newSales);
      setItemToDelete(null);
    }
  };

  // Group by category for Summary
  const summaryTotals = useMemo(() => {
    const acc = {
      hpUnits: 0, hpOmzet: 0, hpProfit: 0,
      totalUnits: 0, totalOmzet: 0, totalProfit: 0
    };

    sales.forEach(sale => {
      const units = Number(sale.units);
      const omzet = Number(sale.omzet);
      const profit = Number(sale.profit);

      acc.totalUnits += units;
      acc.totalOmzet += omzet;
      acc.totalProfit += profit;

      if (sale.category === 'HP Baru' || sale.category === 'HP Second') {
        acc.hpUnits += units;
        acc.hpOmzet += omzet;
        acc.hpProfit += profit;
      }
    });

    return acc;
  }, [sales]);

  const summaryData = [
    { id: 'hp', kategori: 'Handphone', unit: summaryTotals.hpUnits, omzet: summaryTotals.hpOmzet, profit: summaryTotals.hpProfit },
    { id: 'total', kategori: 'TOTAL', unit: summaryTotals.totalUnits, omzet: summaryTotals.totalOmzet, profit: summaryTotals.totalProfit, isTotal: true },
  ];

  const summaryCols = [
    { header: 'Kategori', accessor: 'kategori', render: (val, row) => <span className={row.isTotal ? "font-bold" : ""}>{val}</span> },
    { header: 'Unit', accessor: 'unit', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg" : ""}>{val}</span> },
    { header: 'Omzet', accessor: 'omzet', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg text-brand-700" : "text-brand-600 font-medium"}>{formatRupiah(val)}</span> },
    { header: 'Profit Kotor', accessor: 'profit', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg text-emerald-700" : "text-emerald-600 font-medium"}>{formatRupiah(val)}</span> },
  ];

  const columns = [
    { header: 'Kategori', accessor: 'category', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
    { header: 'Unit', accessor: 'units' },
    { header: 'Omzet', accessor: 'omzet', render: (val) => <span className="text-brand-600">{formatRupiah(val)}</span> },
    { header: 'Profit', accessor: 'profit', render: (val) => <span className="text-emerald-600">{formatRupiah(val)}</span> },
    { header: 'Catatan', accessor: 'notes', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Penjualan Harian</h1>
        <p className="text-slate-500">Catat dan kelola transaksi toko untuk tanggal <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditing ? 'Edit Penjualan' : 'Tambah Penjualan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Penjualan / Omzet</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.omzet}
                  onChange={e => handleCurrencyChange('omzet', e.target.value)}
                  placeholder="Rp 0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HPP / Modal</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.hpp}
                  onChange={e => handleCurrencyChange('hpp', e.target.value)}
                  placeholder="Rp 0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Laba / Profit Kotor (Rp) - <i>Otomatis</i></label>
                <div className="input-field bg-emerald-50 text-emerald-700 font-bold border-emerald-200">
                  {formatRupiah(calculatedProfit)}
                </div>
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
                      setFormData({ id: '', category: 'HP Baru', units: '', omzet: '', hpp: '', notes: '' });
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
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Penjualan</h3>
            <DataTable 
              columns={summaryCols} 
              data={summaryData} 
              keyField="id" 
              getRowClass={(row) => row.isTotal ? "bg-brand-50 hover:bg-brand-100" : ""}
            />
          </div>

          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Riwayat Penjualan</h3>
            </div>
            
            <DataTable 
              columns={columns} 
              data={sales}
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
        title="Hapus Data Penjualan"
        message="Apakah Anda yakin ingin menghapus pencatatan penjualan ini? Data yang dihapus tidak dapat dikembalikan."
      />
    </div>
  );
};

export default DailySales;
