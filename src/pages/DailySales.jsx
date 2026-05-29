import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotal } from '../utils/calculations';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import PremiumTable from '../components/PremiumTable';
import MoneyText from '../components/MoneyText';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import CurrencyInput from '../components/CurrencyInput';
import { Package, DollarSign, TrendingUp, Percent } from 'lucide-react';
import clsx from 'clsx';

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
      omzet: row.omzet,
      hpp: hppVal 
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

  const marginPercentage = summaryTotals.totalOmzet > 0 
    ? ((summaryTotals.totalProfit / summaryTotals.totalOmzet) * 100).toFixed(2)
    : 0;

  const summaryCols = [
    { header: 'Kategori', accessor: 'kategori', render: (val, row) => <span className="font-semibold">{val}</span> },
    { header: 'Unit', accessor: 'unit', align: 'center' },
    { header: 'Omzet', accessor: 'omzet', align: 'right', render: (val) => <MoneyText value={val} /> },
    { header: 'Profit Kotor', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
  ];

  const columns = [
    { 
      header: 'Kategori', 
      accessor: 'category', 
      render: (val) => (
        <Badge color={val === 'HP Baru' ? 'brand' : val === 'HP Second' ? 'amber' : 'slate'}>
          {val}
        </Badge>
      ) 
    },
    { header: 'Unit', accessor: 'units', align: 'center' },
    { header: 'Omzet', accessor: 'omzet', align: 'right', render: (val) => <MoneyText value={val} /> },
    { header: 'Profit', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
    { header: 'Catatan', accessor: 'notes', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
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
        title="Penjualan Harian" 
        subtitle="Catat dan kelola transaksi toko untuk hari ini."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard 
          title="Total Unit" 
          value={summaryTotals.totalUnits} 
          icon={Package} 
          isCurrency={false}
          color="blue" 
          className="delay-100 animate-fade-in-up"
        />
        <SummaryCard 
          title="Total Omzet" 
          value={summaryTotals.totalOmzet} 
          icon={DollarSign} 
          color="brand" 
          className="delay-200 animate-fade-in-up"
        />
        <SummaryCard 
          title="Total Profit" 
          value={summaryTotals.totalProfit} 
          icon={TrendingUp} 
          color="emerald" 
          className="delay-300 animate-fade-in-up"
        />
        <SummaryCard 
          title="Margin Kotor" 
          value={`${marginPercentage}%`} 
          icon={Percent} 
          isCurrency={false}
          color="indigo" 
          className="delay-400 animate-fade-in-up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title={isEditing ? 'Edit Penjualan' : 'Tambah Penjualan'} delayClass="delay-400">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Terjual</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={formData.units}
                  onChange={e => setFormData({...formData, units: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Penjualan / Omzet</label>
                <CurrencyInput 
                  className="input-field"
                  value={formData.omzet}
                  onChange={e => setFormData({...formData, omzet: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">HPP / Modal</label>
                <CurrencyInput 
                  className="input-field"
                  value={formData.hpp}
                  onChange={e => setFormData({...formData, hpp: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Laba / Profit Kotor (Rp) - <i>Otomatis</i></label>
                <div className="input-field bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-200 dark:border-emerald-800/50">
                  {formatRupiah(calculatedProfit)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
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
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Ringkasan Penjualan" delayClass="delay-500">
            <PremiumTable 
              columns={summaryCols} 
              data={summaryData} 
              highlightTotalRow={true}
            />
          </SectionCard>

          <SectionCard title="Riwayat Penjualan" delayClass="delay-500">
            <PremiumTable 
              columns={columns} 
              data={sales}
            />
          </SectionCard>
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
