import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { calculateMargin, filterSalesByDateRange, calculateTotal, calculateTotalStok, calculateTotalUangAktif } from '../utils/calculations';
import { Download, ShieldCheck, ShieldAlert, Calendar, CalendarDays, Users, Upload, Database, Cloud } from 'lucide-react';
import DataTable from '../components/DataTable';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const Reports = () => {
  const { activeData, activeDate, db } = useApp();
  
  const [reportMode, setReportMode] = useState('active'); // 'active' or 'range'

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  // --- DATA UNTUK MODE TANGGAL AKTIF ---
  const activeOmzet = calculateTotal(activeData.sales, 'omzet');
  const activeProfit = calculateTotal(activeData.sales, 'profit');
  const activeUnits = calculateTotal(activeData.sales, 'units');
  const activeMargin = calculateMargin(activeProfit, activeOmzet);
  const activeStok = calculateTotalStok(activeData.stockCondition);
  const activeTagihan = calculateTotal(activeData.bills.filter(b => b.status !== 'Lunas'), 'amount');
  const activeUang = calculateTotalUangAktif(activeData.cashPosition);

  // --- DATA UNTUK MODE RANGE ---
  const rangeData = useMemo(() => {
    if (!db) return { sales: [], salesPerformance: [], bills: [], stockCondition: {}, cashPosition: {} };
    
    let allSales = [];
    let allSalesPerformance = [];
    Object.keys(db).forEach(dateKey => {
      if (dateKey >= startDate && dateKey <= endDate) {
        if (db[dateKey].sales) {
          allSales = [...allSales, ...db[dateKey].sales];
        }
        if (db[dateKey].salesPerformance) {
          allSalesPerformance = [...allSalesPerformance, ...db[dateKey].salesPerformance];
        }
      }
    });

    const endSnapshot = db[endDate] || activeData;

    return {
      sales: allSales,
      salesPerformance: allSalesPerformance,
      bills: endSnapshot.bills || [],
      stockCondition: endSnapshot.stockCondition || {},
      cashPosition: endSnapshot.cashPosition || {}
    };
  }, [db, startDate, endDate, activeData]);

  const rangeOmzet = calculateTotal(rangeData.sales, 'omzet');
  const rangeProfit = calculateTotal(rangeData.sales, 'profit');
  const rangeUnits = calculateTotal(rangeData.sales, 'units');
  const rangeMargin = calculateMargin(rangeProfit, rangeOmzet);
  const rangeStok = calculateTotalStok(rangeData.stockCondition);
  const rangeTagihan = calculateTotal(rangeData.bills.filter(b => b.status !== 'Lunas'), 'amount');
  const rangeUang = calculateTotalUangAktif(rangeData.cashPosition);

  // --- RENDER VARIABLES ---
  const displayOmzet = reportMode === 'active' ? activeOmzet : rangeOmzet;
  const displayProfit = reportMode === 'active' ? activeProfit : rangeProfit;
  const displayUnits = reportMode === 'active' ? activeUnits : rangeUnits;
  const displayMargin = reportMode === 'active' ? activeMargin : rangeMargin;
  const displayStok = reportMode === 'active' ? activeStok : rangeStok;
  const displayTagihan = reportMode === 'active' ? activeTagihan : rangeTagihan;
  const displayUang = reportMode === 'active' ? activeUang : rangeUang;
  const targetSales = reportMode === 'active' ? activeData.sales : rangeData.sales;

  const selisihUang = displayUang - displayTagihan;
  const isAman = selisihUang >= 0;

  const exportCSV = () => {
    if (!targetSales || targetSales.length === 0) {
      alert('Tidak ada data penjualan untuk diexport.');
      return;
    }

    const headers = ['Tanggal', 'Kategori', 'Unit', 'Omzet', 'Profit', 'Catatan'];
    const csvContent = [
      headers.join(','),
      ...targetSales.map(s => 
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
    
    const fileName = reportMode === 'active' 
      ? `laporan_penjualan_${activeDate}.csv`
      : `laporan_penjualan_${startDate}_sd_${endDate}.csv`;

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDatabase = () => {
    if (!db) {
      alert('Tidak ada data untuk dibackup.');
      return;
    }
    const jsonString = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_ogstore_${todayStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importDatabase = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedDb = JSON.parse(event.target.result);
        if (typeof importedDb === 'object' && importedDb !== null) {
          if (window.confirm('PERINGATAN: Mengimpor data akan MENIMPA semua data di Cloud. Anda yakin ingin melanjutkan?')) {
            // Update local storage just in case
            localStorage.setItem('og_store_daily_db', JSON.stringify(importedDb));
            
            // Upload to Supabase
            const promises = Object.keys(importedDb).map(dateKey => 
              supabase.from('daily_snapshots').upsert({ date: dateKey, data: importedDb[dateKey] })
            );
            await Promise.all(promises);
            
            alert('Restore ke Cloud berhasil!');
            window.location.reload();
          }
        } else {
          alert('Format file tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan file tersebut adalah hasil backup aplikasi ini.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = null;
  };

  // --- SALES PERFORMANCE COLUMNS & DATA ---
  const activePerfData = activeData.salesPerformance || [];
  
  const rangePerfDataMap = {};
  (rangeData.salesPerformance || []).forEach(sp => {
    if (!rangePerfDataMap[sp.name]) rangePerfDataMap[sp.name] = { name: sp.name, unit: 0, profit: 0 };
    rangePerfDataMap[sp.name].unit += Number(sp.unit);
    rangePerfDataMap[sp.name].profit += Number(sp.profit);
  });
  
  const rangePerfData = Object.values(rangePerfDataMap).sort((a, b) => b.profit - a.profit);
  const rangeTotalUnit = rangePerfData.reduce((sum, item) => sum + item.unit, 0);
  const rangeTotalProfit = rangePerfData.reduce((sum, item) => sum + item.profit, 0);
  
  const rangePerfDataWithTotal = [
    ...rangePerfData,
    ...(rangePerfData.length > 0 ? [{ name: 'TOTAL', unit: rangeTotalUnit, profit: rangeTotalProfit, isTotal: true }] : [])
  ];

  const activePerfColumns = [
    { header: 'Nama', accessor: 'name', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Profit', accessor: 'profit', render: (val) => <span className="text-emerald-600 font-medium">{formatRupiah(val)}</span> },
    { header: 'Catatan', accessor: 'note', render: (val) => <span className="text-slate-500 text-xs italic">{val || '-'}</span> },
  ];

  const rangePerfColumns = [
    { header: 'Nama', accessor: 'name', render: (val, row) => <span className={row.isTotal ? "font-bold text-slate-800" : "font-medium text-slate-700"}>{val}</span> },
    { header: 'Total Unit', accessor: 'unit', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg" : ""}>{val}</span> },
    { header: 'Total Profit', accessor: 'profit', render: (val, row) => <span className={clsx("text-emerald-600", row.isTotal ? "font-bold text-lg text-emerald-700" : "font-medium")}>{formatRupiah(val)}</span> },
    { header: 'Rata-rata Profit/Unit', accessor: 'avg', render: (_, row) => <span className="text-teal-600 font-medium">{row.unit > 0 ? formatRupiah(Math.floor(row.profit / row.unit)) : 'Rp 0'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="bg-white p-2 rounded-xl border border-slate-200 inline-flex">
        <button 
          onClick={() => setReportMode('active')}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors",
            reportMode === 'active' ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Laporan Tanggal Aktif
        </button>
        <button 
          onClick={() => setReportMode('range')}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors",
            reportMode === 'range' ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Laporan Rentang Waktu
        </button>
      </div>

      {reportMode === 'active' ? (
        <div className="card p-5 border-l-4 border-l-brand-500 shadow-sm bg-brand-50/30">
          <h3 className="text-sm font-medium text-slate-700">Menampilkan Data Untuk Tanggal:</h3>
          <p className="text-lg font-bold text-brand-700 mt-1">{formatDate(activeDate)}</p>
          <p className="text-xs text-slate-500 mt-2">Untuk mengubah tanggal, gunakan pemilih tanggal (Date Picker) di kanan atas.</p>
        </div>
      ) : (
        <div className="card p-5 border-l-4 border-l-brand-500 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Filter Rentang Tanggal</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Mulai</label>
              <input 
                type="date" 
                className="input-field py-1.5 bg-slate-50" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sampai</label>
              <input 
                type="date" 
                className="input-field py-1.5 bg-slate-50" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-brand-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Performa Penjualan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Omzet</span>
                <span className="font-bold text-lg text-slate-800">{formatRupiah(displayOmzet)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Profit Kotor</span>
                <span className="font-bold text-lg text-emerald-600">{formatRupiah(displayProfit)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Unit Terjual</span>
                <span className="font-bold text-lg text-slate-800">{displayUnits} Unit</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-600">Margin Kotor</span>
                <span className="font-bold text-lg text-blue-600">{displayMargin}%</span>
              </div>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-indigo-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Inventaris</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Nilai Stok</span>
                <span className="font-bold text-lg text-indigo-700">{formatRupiah(displayStok)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-amber-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Posisi Keuangan</h3>
            
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
                <span className="font-bold text-lg text-emerald-600">{formatRupiah(displayUang)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-600">Total Tagihan Aktif</span>
                <span className="font-bold text-lg text-red-600">{formatRupiah(displayTagihan)}</span>
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

      <div className="card p-6 mt-6 border-t-4 border-t-blue-500">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Users className="w-5 h-5 text-blue-500 mr-2" />
          Laporan Performa Sales
        </h3>
        
        {reportMode === 'active' ? (
          <DataTable 
            columns={activePerfColumns} 
            data={activePerfData} 
            keyField="id" 
          />
        ) : (
          <DataTable 
            columns={rangePerfColumns} 
            data={rangePerfDataWithTotal} 
            keyField="name" 
            getRowClass={(row) => row.isTotal ? "bg-emerald-50 hover:bg-emerald-100" : ""}
          />
        )}
      </div>

      <div className="card p-6 mt-6 border-t-4 border-t-slate-800">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Cloud className="w-5 h-5 text-slate-700 mr-2" />
          Ekspor / Impor Database Cloud
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Data Anda sekarang sudah otomatis tersinkron di Cloud (Supabase).
          Gunakan fitur ini hanya jika Anda ingin menyimpan cadangan offline ke dalam komputer Anda, atau mengimpor data lama.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={exportDatabase} className="btn-primary bg-slate-800 hover:bg-slate-900 flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Download Backup (.json)
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={importDatabase}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="btn-secondary w-full flex items-center justify-center border-slate-300 text-slate-700 hover:bg-slate-50">
              <Upload className="w-4 h-4 mr-2" />
              Restore Data (.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
