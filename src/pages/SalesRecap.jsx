import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { filterSalesByDateRange } from '../utils/calculations';
import DataTable from '../components/DataTable';
import clsx from 'clsx';

const CategoryBadge = ({ category }) => {
  if (category === 'Handphone' || category === 'HP Baru' || category === 'HP Second') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200"><span className="mr-1">📱</span> Handphone</span>;
  }
  if (category === 'TOTAL') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand-600 text-white text-xs font-bold border border-brand-700">TOTAL KESELURUHAN</span>;
  }
  return <span>{category}</span>;
};

const SalesRecap = () => {
  const { db } = useApp();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const salesData = useMemo(() => {
    let allSales = [];
    let allSalesPerformance = [];
    if (db) {
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
    }
    return { allSales, allSalesPerformance };
  }, [db, startDate, endDate]);
  
  const filteredSales = salesData.allSales;
  const filteredPerf = salesData.allSalesPerformance;

  const setQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // Group by category for Summary
  const summaryTotals = useMemo(() => {
    const acc = {
      hpUnits: 0, hpOmzet: 0, hpProfit: 0,
      totalUnits: 0, totalOmzet: 0, totalProfit: 0
    };

    filteredSales.forEach(sale => {
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
  }, [filteredSales]);

  const summaryData = [
    { id: 'hp', kategori: 'Handphone', unit: summaryTotals.hpUnits, omzet: summaryTotals.hpOmzet, profit: summaryTotals.hpProfit },
    { id: 'total', kategori: 'TOTAL', unit: summaryTotals.totalUnits, omzet: summaryTotals.totalOmzet, profit: summaryTotals.totalProfit, isTotal: true },
  ];

  // Group by date and category for detail table
  const detailData = useMemo(() => {
    const groups = {}; // Key format: date_category
    filteredSales.forEach(sale => {
      const displayCategory = (sale.category === 'HP Baru' || sale.category === 'HP Second') ? 'Handphone' : sale.category;
      const key = `${sale.date}_${displayCategory}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          date: sale.date,
          category: displayCategory,
          units: 0,
          omzet: 0,
          profit: 0,
          notes: []
        };
      }
      groups[key].units += Number(sale.units);
      groups[key].omzet += Number(sale.omzet);
      groups[key].profit += Number(sale.profit);
      if (sale.notes && sale.notes !== '-') {
        groups[key].notes.push(sale.notes);
      }
    });
  
    // Sort array
    const sortedArray = Object.values(groups)
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return a.category.localeCompare(b.category);
      });

    // Mark isFirstOfDay to hide duplicate dates in UI
    let lastDate = null;
    return sortedArray.map(g => {
      const isFirstOfDay = g.date !== lastDate;
      lastDate = g.date;
      return { ...g, isFirstOfDay, catatanStr: g.notes.join(', ') || '-' };
    });
  }, [filteredSales]);

  // Aggregate Sales Performance by name
  const perfData = useMemo(() => {
    const map = {};
    filteredPerf.forEach(sp => {
      if (!map[sp.name]) map[sp.name] = { name: sp.name, unit: 0, profit: 0 };
      map[sp.name].unit += Number(sp.unit);
      map[sp.name].profit += Number(sp.profit);
    });

    const arr = Object.values(map).sort((a, b) => b.profit - a.profit);
    const totalUnit = arr.reduce((sum, item) => sum + item.unit, 0);
    const totalProfit = arr.reduce((sum, item) => sum + item.profit, 0);
    
    return [
      ...arr,
      ...(arr.length > 0 ? [{ name: 'TOTAL', unit: totalUnit, profit: totalProfit, isTotal: true }] : [])
    ];
  }, [filteredPerf]);

  // Special columns for Summary
  const summaryColumns = [
    { 
      header: 'Kategori', 
      accessor: 'kategori', 
      render: (val, row) => <CategoryBadge category={val} />
    },
    { 
      header: 'Unit', 
      accessor: 'unit', 
      render: (val, row) => <span className={clsx(row.isTotal && "font-bold text-lg")}>{val}</span> 
    },
    { 
      header: 'Omzet', 
      accessor: 'omzet', 
      render: (val, row) => <span className={clsx("text-brand-600 font-medium", row.isTotal && "font-bold text-lg text-brand-700")}>{formatRupiah(val)}</span> 
    },
    { 
      header: 'Profit Kotor', 
      accessor: 'profit', 
      render: (val, row) => <span className={clsx("text-emerald-600 font-medium", row.isTotal && "font-bold text-lg text-emerald-700")}>{formatRupiah(val)}</span> 
    },
  ];

  const detailColumns = [
    { 
      header: 'Tanggal', 
      accessor: 'date', 
      render: (val, row) => row.isFirstOfDay ? (
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-xs">{formatDate(val)}</span>
      ) : null 
    },
    { 
      header: 'Kategori', 
      accessor: 'category',
      render: (val) => <CategoryBadge category={val} />
    },
    { header: 'Unit', accessor: 'units', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
    { header: 'Omzet', accessor: 'omzet', render: (val) => <span className="text-brand-600">{formatRupiah(val)}</span> },
    { header: 'Profit Kotor', accessor: 'profit', render: (val) => <span className="text-emerald-600">{formatRupiah(val)}</span> },
    { header: 'Catatan', accessor: 'catatanStr', render: (val) => <span className="text-slate-500 text-xs italic">{val}</span> },
  ];

  const perfColumns = [
    { header: 'Nama', accessor: 'name', render: (val, row) => <span className={row.isTotal ? "font-bold text-slate-800" : "font-medium text-slate-700"}>{val}</span> },
    { header: 'Total Unit', accessor: 'unit', render: (val, row) => <span className={row.isTotal ? "font-bold text-lg" : ""}>{val}</span> },
    { header: 'Total Profit', accessor: 'profit', render: (val, row) => <span className={clsx("text-emerald-600", row.isTotal ? "font-bold text-lg text-emerald-700" : "font-medium")}>{formatRupiah(val)}</span> },
    { header: 'Rata-rata Profit/Unit', accessor: 'avg', render: (_, row) => <span className="text-teal-600 font-medium">{row.unit > 0 ? formatRupiah(Math.floor(row.profit / row.unit)) : 'Rp 0'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rekap Penjualan</h1>
        <p className="text-slate-500">Rekapitulasi penjualan berdasarkan rentang tanggal.</p>
      </div>

      <div className="card p-5 border-l-4 border-l-brand-500 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-2 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mulai</label>
            <input 
              type="date" 
              className="input-field bg-slate-50" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sampai</label>
            <input 
              type="date" 
              className="input-field bg-slate-50" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm bg-white" onClick={() => setQuickFilter(0)}>Hari Ini</button>
            <button className="btn-secondary text-sm bg-white" onClick={() => setQuickFilter(7)}>7 Hari</button>
            <button className="btn-secondary text-sm bg-white" onClick={() => setQuickFilter(14)}>14 Hari</button>
            <button className="btn-secondary text-sm bg-white" onClick={() => setQuickFilter(30)}>30 Hari</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2 h-6 bg-brand-500 rounded-full mr-2"></span>
            Total Penjualan per Kategori
          </h3>
          <DataTable 
            columns={summaryColumns} 
            data={summaryData} 
            keyField="id" 
            getRowClass={(row) => row.isTotal ? "bg-brand-50 hover:bg-brand-100" : ""}
          />
        </div>

        <div className="xl:col-span-4 mt-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-2 h-6 bg-slate-800 rounded-full mr-2"></span>
            Detail Harian Teragregasi
          </h3>
          <DataTable 
            columns={detailColumns} 
            data={detailData} 
            keyField="id" 
            getRowClass={(row) => row.isFirstOfDay ? "border-t-[3px] border-slate-200" : "border-t border-dashed border-slate-100"}
          />
        </div>

        {perfData.length > 0 && (
          <div className="xl:col-span-4 mt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
              Rekap Performa Sales 1–30 Hari
            </h3>
            <DataTable 
              columns={perfColumns} 
              data={perfData} 
              keyField="name" 
              getRowClass={(row) => row.isTotal ? "bg-emerald-50 hover:bg-emerald-100" : ""}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRecap;
