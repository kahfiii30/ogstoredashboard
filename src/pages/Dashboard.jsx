import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertCircle, 
  CreditCard,
  Wallet,
  Loader2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSales, useBills, useConfigData } from '../hooks/useSupabase';
import { formatRupiah, formatDate } from '../utils/format';
import { calculateTotal, calculateTotalStok, calculateTotalUangAktif, filterSalesByDateRange } from '../utils/calculations';
import SummaryCard from '../components/SummaryCard';
import ChartCard from '../components/ChartCard';
import AlertBox from '../components/AlertBox';
import DataTable from '../components/DataTable';

const COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { sales, loading: salesLoading } = useSales();
  const { bills, loading: billsLoading } = useBills();
  const { data: stockAging, loading: agingLoading } = useConfigData('stock_aging', { '0-14': 0, '15-30': 0, '31-60': 0, '>60': 0 });
  const { data: stockCondition, loading: condLoading } = useConfigData('stock_condition', { hpBaru: 0, hpSecond: 0, aksesoris: 0 });
  const { data: cashPosition, loading: cashLoading } = useConfigData('cash_position', { cash: 0, bank: 0, ewallet: 0, piutang: 0 });

  const loading = salesLoading || billsLoading || agingLoading || condLoading || cashLoading;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Calculations for Today
  const todaySales = filterSalesByDateRange(sales, todayStr, todayStr);
  const yesterdaySales = filterSalesByDateRange(sales, yesterdayStr, yesterdayStr);
  const todayOmzet = calculateTotal(todaySales, 'omzet');
  const todayProfit = calculateTotal(todaySales, 'profit');
  const todayUnits = calculateTotal(todaySales, 'units');

  // Overall calculations
  const totalStok = calculateTotalStok(stockCondition);
  const totalTagihan = calculateTotal(bills.filter(b => b.status !== 'Lunas'), 'amount');
  const totalUangAktif = calculateTotalUangAktif(cashPosition);
  
  // Alerts logic
  const isAgingCritical = stockAging['>60'] > 300000000;
  const isCashflowCritical = totalTagihan > totalUangAktif;

  // Chart Data Preparation
  const chartData30Days = useMemo(() => {
    const dataMap = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Initialize map
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      dataMap[dStr] = { date: dStr, displayDate: d.getDate() + '/' + (d.getMonth()+1), omzet: 0, hpBaru: 0, hpSecond: 0 };
    }

    sales.forEach(sale => {
      if (dataMap[sale.date]) {
        dataMap[sale.date].omzet += Number(sale.omzet);
        if (sale.category === 'HP Baru') dataMap[sale.date].hpBaru += Number(sale.units);
        if (sale.category === 'HP Second') dataMap[sale.date].hpSecond += Number(sale.units);
      }
    });

    return Object.values(dataMap);
  }, [sales]);

  const stockPieData = [
    { name: 'HP Baru', value: stockCondition.hpBaru },
    { name: 'HP Second', value: stockCondition.hpSecond },
    { name: 'Aksesoris', value: stockCondition.aksesoris },
  ];

  const recentSalesCols = [
    { header: 'Kategori', accessor: 'category' },
    { header: 'Unit', accessor: 'units' },
    { header: 'Omzet', accessor: 'omzet', render: (val) => formatRupiah(val) },
    { header: 'Profit Kotor', accessor: 'profit', render: (val) => formatRupiah(val) },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
          <p className="text-slate-500">Ringkasan bisnis Anda hari ini.</p>
        </div>
      </div>

      {(isAgingCritical || isCashflowCritical) && (
        <div className="space-y-3">
          {isAgingCritical && (
            <AlertBox 
              type="warning" 
              title="Perhatian: Stok Aging" 
              message={`Stok >60 hari sudah mencapai ${formatRupiah(stockAging['>60'])}. Cashflow mungkin mulai berat, pertimbangkan untuk cuci gudang atau diskon khusus.`}
            />
          )}
          {isCashflowCritical && (
            <AlertBox 
              type="error" 
              title="Kritis: Posisi Keuangan" 
              message={`Total uang aktif (${formatRupiah(totalUangAktif)}) lebih kecil dari tagihan aktif (${formatRupiah(totalTagihan)}). Harap segera atur strategi pembayaran.`}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard 
          title="Omzet Hari Ini" 
          value={formatRupiah(todayOmzet)} 
          icon={DollarSign} 
          colorClass="bg-brand-100 text-brand-600"
        />
        <SummaryCard 
          title="Profit Kotor Hari Ini" 
          value={formatRupiah(todayProfit)} 
          icon={TrendingUp} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SummaryCard 
          title="Unit Terjual Hari Ini" 
          value={`${todayUnits} Unit`} 
          icon={Package} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <SummaryCard 
          title="Total Nilai Stok" 
          value={formatRupiah(totalStok)} 
          icon={Package} 
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <SummaryCard 
          title="Total Uang Aktif" 
          value={formatRupiah(totalUangAktif)} 
          icon={Wallet} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SummaryCard 
          title="Total Tagihan" 
          value={formatRupiah(totalTagihan)} 
          icon={CreditCard} 
          colorClass="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Trend Omzet (30 Hari)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData30Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `Rp${(value/1000000)}M`}
              />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Line type="monotone" dataKey="omzet" stroke="#14b8a6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Unit HP Baru vs HP Second (30 Hari)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData30Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hpBaru" name="HP Baru" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hpSecond" name="HP Second" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Komposisi Stok">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stockPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Penjualan Kemarin</h3>
              <p className="text-sm text-slate-500 mt-1">{formatDate(yesterdayStr)}</p>
            </div>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">Review H-1</span>
          </div>
          <DataTable 
            columns={recentSalesCols} 
            data={yesterdaySales} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
