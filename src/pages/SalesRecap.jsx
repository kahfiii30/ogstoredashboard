import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { filterSalesByDateRange } from '../utils/calculations';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import SummaryCard from '../components/SummaryCard';
import SectionCard from '../components/SectionCard';
import PremiumTable from '../components/PremiumTable';
import MoneyText from '../components/MoneyText';
import Badge from '../components/Badge';
import { Package, DollarSign, TrendingUp, Percent } from 'lucide-react';
import clsx from 'clsx';

const CategoryBadge = ({ category }) => {
  if (category === 'HP Baru') {
    return <Badge color="brand"><span className="mr-1">📦</span> HP Baru</Badge>;
  }
  if (category === 'HP Second') {
    return <Badge color="amber"><span className="mr-1">🔄</span> HP Second</Badge>;
  }
  if (category === 'TOTAL') {
    return <Badge color="blue">TOTAL KESELURUHAN</Badge>;
  }
  return <Badge color="slate">{category}</Badge>;
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

  const [activeFilter, setActiveFilter] = useState('30days');

  const setQuickFilter = (days, id) => {
    setActiveFilter(id);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };
  
  const handleQuickFilter = (id) => {
    if (id === 'today') setQuickFilter(0, id);
    if (id === '7days') setQuickFilter(7, id);
    if (id === '14days') setQuickFilter(14, id);
    if (id === '30days') setQuickFilter(30, id);
  };

  // Group by category for Summary
  const summaryTotals = useMemo(() => {
    const acc = {
      hpBaruUnits: 0, hpBaruOmzet: 0, hpBaruProfit: 0,
      hpSecondUnits: 0, hpSecondOmzet: 0, hpSecondProfit: 0,
      totalUnits: 0, totalOmzet: 0, totalProfit: 0
    };

    filteredSales.forEach(sale => {
      const units = Number(sale.units);
      const omzet = Number(sale.omzet);
      const profit = Number(sale.profit);

      acc.totalUnits += units;
      acc.totalOmzet += omzet;
      acc.totalProfit += profit;

      if (sale.category === 'HP Baru') {
        acc.hpBaruUnits += units;
        acc.hpBaruOmzet += omzet;
        acc.hpBaruProfit += profit;
      } else if (sale.category === 'HP Second') {
        acc.hpSecondUnits += units;
        acc.hpSecondOmzet += omzet;
        acc.hpSecondProfit += profit;
      }
    });

    return acc;
  }, [filteredSales]);

  const summaryData = [
    { id: 'hpbaru', kategori: 'HP Baru', unit: summaryTotals.hpBaruUnits, omzet: summaryTotals.hpBaruOmzet, profit: summaryTotals.hpBaruProfit },
    { id: 'hpsec', kategori: 'HP Second', unit: summaryTotals.hpSecondUnits, omzet: summaryTotals.hpSecondOmzet, profit: summaryTotals.hpSecondProfit },
    { id: 'total', kategori: 'TOTAL', unit: summaryTotals.totalUnits, omzet: summaryTotals.totalOmzet, profit: summaryTotals.totalProfit, isTotal: true },
  ];

  // Group by date and category for detail table
  const detailData = useMemo(() => {
    const groups = {}; // Key format: date_category
    filteredSales.forEach(sale => {
      const key = `${sale.date}_${sale.category}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          date: sale.date,
          category: sale.category,
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
      align: 'center'
    },
    { 
      header: 'Omzet', 
      accessor: 'omzet', 
      align: 'right',
      render: (val, row) => <MoneyText value={val} /> 
    },
    { 
      header: 'Profit Kotor', 
      accessor: 'profit', 
      align: 'right',
      render: (val, row) => <MoneyText value={val} showColor /> 
    },
  ];

  const detailColumns = [
    { 
      header: 'Tanggal', 
      accessor: 'date', 
      render: (val, row) => row.isFirstOfDay ? (
        <Badge color="slate">{formatDate(val)}</Badge>
      ) : null 
    },
    { 
      header: 'Kategori', 
      accessor: 'category',
      render: (val) => <CategoryBadge category={val} />
    },
    { header: 'Unit', accessor: 'units', align: 'center' },
    { header: 'Omzet', accessor: 'omzet', align: 'right', render: (val) => <MoneyText value={val} /> },
    { header: 'Profit Kotor', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
    { header: 'Catatan', accessor: 'catatanStr', render: (val) => <span className="text-slate-500 text-xs italic">{val}</span> },
  ];

  const perfColumns = [
    { header: 'Nama', accessor: 'name', render: (val, row) => <span className="font-medium">{val}</span> },
    { header: 'Total Unit', accessor: 'unit', align: 'center' },
    { header: 'Total Profit', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
    { header: 'Rata-rata Profit/Unit', accessor: 'avg', align: 'right', render: (_, row) => <MoneyText value={row.unit > 0 ? Math.floor(row.profit / row.unit) : 0} /> },
  ];

  const marginPercentage = summaryTotals.totalOmzet > 0 
    ? ((summaryTotals.totalProfit / summaryTotals.totalOmzet) * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Rekap Penjualan" 
        subtitle="Rekapitulasi penjualan berdasarkan rentang tanggal." 
      />

      <FilterBar 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => { setStartDate(v); setActiveFilter(''); }}
        onEndDateChange={(v) => { setEndDate(v); setActiveFilter(''); }}
        onQuickFilter={handleQuickFilter}
        activeFilter={activeFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard 
          title="Total Unit" 
          value={summaryTotals.totalUnits} 
          icon={Package} 
          isCurrency={false}
          color="blue" 
        />
        <SummaryCard 
          title="Total Omzet" 
          value={summaryTotals.totalOmzet} 
          icon={DollarSign} 
          color="brand" 
        />
        <SummaryCard 
          title="Total Profit" 
          value={summaryTotals.totalProfit} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <SummaryCard 
          title="Margin Kotor" 
          value={`${marginPercentage}%`} 
          icon={Percent} 
          isCurrency={false}
          color="indigo" 
        />
      </div>

      <SectionCard title="Total Penjualan per Kategori">
        <PremiumTable 
          columns={summaryColumns} 
          data={summaryData} 
          highlightTotalRow={true}
        />
      </SectionCard>

      <SectionCard title="Detail Harian Teragregasi">
        <PremiumTable 
          columns={detailColumns} 
          data={detailData} 
        />
      </SectionCard>

      {perfData.length > 0 && (
        <SectionCard title="Rekap Performa Sales 1–30 Hari">
          <PremiumTable 
            columns={perfColumns} 
            data={perfData} 
            highlightTotalRow={true}
          />
        </SectionCard>
      )}
    </div>
  );
};

export default SalesRecap;
