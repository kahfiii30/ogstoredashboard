import React, { useState } from 'react';
import { useSales, useBills, useConfigData } from '../hooks/useSupabase';
import { formatRupiah } from '../utils/format';
import { calculateMargin, filterSalesByDateRange, calculateTotal, calculateTotalStok, calculateTotalUangAktif } from '../utils/calculations';
import { Download, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

const Reports = () => {
  const { sales, loading: salesLoading } = useSales();
  const { data: stockCondition, loading: condLoading } = useConfigData('stock_condition', { hpBaru: 0, hpSecond: 0, aksesoris: 0 });
  const { bills, loading: billsLoading } = useBills();
  const { data: cashPosition, loading: cashLoading } = useConfigData('cash_position', { cash: 0, bank: 0, ewallet: 0, piutang: 0 });

  const loading = salesLoading || billsLoading || condLoading || cashLoading;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const filteredSales = filterSalesByDateRange(sales, startDate, endDate);

  const totalOmzet = calculateTotal(filteredSales, 'omzet');
  const totalProfit = calculateTotal(filteredSales, 'profit');
  const totalUnits = calculateTotal(filteredSales, 'units');
  const marginKotor = calculateMargin(totalProfit, totalOmzet);

  const totalStok = calculateTotalStok(stockCondition);
  const totalTagihan = calculateTotal(bills.filter(b => b.status !== 'Lunas'), 'amount');
  const totalUangAktif = calculateTotalUangAktif(cashPosition);
  
  const selisihUang = totalUangAktif - totalTagihan;
  const isAman = selisihUang >= 0;

  const exportCSV = () => {
    if (filteredSales.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }

    const headers = ['Tanggal', 'Kategori', 'Unit', 'Omzet', 'Profit', 'Catatan'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map(s => 
        [
          s.date, 
          s.category, 
          s.units, 
          s.omzet, 
          s.profit, 
          `"${s.notes ? s.notes.replace(/"/g, '""') : '-'}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_penjualan_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Bisnis</h1>
          <p className="text-slate-500">Ringkasan performa dan metrik penting.</p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center justify-center">
          <Download className="w-4 h-4 mr-2" />
          Export CSV Penjualan
        </button>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Filter Tanggal Laporan Penjualan</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mulai</label>
            <input 
              type="date" 
              className="input-field py-1.5" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sampai</label>
            <input 
              type="date" 
              className="input-field py-1.5" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-brand-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Performa Penjualan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Omzet</span>
                <span className="font-bold text-lg text-slate-800">{formatRupiah(totalOmzet)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Profit Kotor</span>
                <span className="font-bold text-lg text-emerald-600">{formatRupiah(totalProfit)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Unit Terjual</span>
                <span className="font-bold text-lg text-slate-800">{totalUnits} Unit</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-600">Margin Kotor</span>
                <span className="font-bold text-lg text-blue-600">{marginKotor}%</span>
              </div>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-indigo-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Inventaris</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Nilai Stok</span>
                <span className="font-bold text-lg text-indigo-700">{formatRupiah(totalStok)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-amber-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Posisi Keuangan (Saat Ini)</h3>
            
            <div className="mb-6">
              {isAman ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-start">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Status: AMAN</h4>
                    <p className="text-sm mt-1">Uang aktif mencukupi untuk membayar seluruh tagihan jatuh tempo.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
                  <ShieldAlert className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Status: WASPADA</h4>
                    <p className="text-sm mt-1">Uang aktif lebih kecil dari total tagihan! Segera cairkan piutang atau tingkatkan penjualan.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Uang Aktif</span>
                <span className="font-bold text-lg text-emerald-600">{formatRupiah(totalUangAktif)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Tagihan Aktif</span>
                <span className="font-bold text-lg text-red-600">{formatRupiah(totalTagihan)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-700">Selisih (Uang - Tagihan)</span>
                <span className={`font-bold text-lg ${isAman ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isAman ? '+' : ''}{formatRupiah(selisihUang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
