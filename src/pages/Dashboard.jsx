import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Award
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { calculateTotal, calculateTotalStok, calculateTotalUangAktif } from '../utils/calculations';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import ChartCard from '../components/ChartCard';
import AlertBox from '../components/AlertBox';
import PremiumTable from '../components/PremiumTable';
import PageHeader from '../components/PageHeader';
import MoneyText from '../components/MoneyText';

const COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444'];



const Dashboard = () => {
  const { activeData, previousData, activeDate, db } = useApp();

  // Active Date Calculations
  const activeOmzet = calculateTotal(activeData.sales, 'omzet');
  const activeProfit = calculateTotal(activeData.sales, 'profit');
  const activeUnits = calculateTotal(activeData.sales, 'units');
  const activeStok = calculateTotalStok(activeData.stockCondition);
  const activeTagihan = calculateTotal(activeData.bills.filter(b => b.status !== 'Lunas'), 'amount');
  const activeUang = calculateTotalUangAktif(activeData.cashPosition);

  // Sales Performance
  const activeSalesPerformance = activeData.salesPerformance || [];
  const activeSalesPerfUnit = activeSalesPerformance.reduce((sum, s) => sum + Number(s.unit), 0);
  const activeSalesPerfProfit = activeSalesPerformance.reduce((sum, s) => sum + Number(s.profit), 0);
  const bestSalesPerf = [...activeSalesPerformance].sort((a, b) => b.profit - a.profit)[0];

  // Previous Date Calculations
  const prevOmzet = calculateTotal(previousData.sales, 'omzet');
  const prevProfit = calculateTotal(previousData.sales, 'profit');
  const prevTagihan = calculateTotal(previousData.bills.filter(b => b.status !== 'Lunas'), 'amount');
  const prevUang = calculateTotalUangAktif(previousData.cashPosition);
  
  // Alerts logic
  const isAgingCritical = activeData.stockAging['>60'] > 300000000;
  const isCashflowCritical = activeTagihan > activeUang;

  // Chart Data Preparation (across all dates)
  const chartData30Days = useMemo(() => {
    const dataMap = {};
    const todayDate = new Date();
    
      for (let i = 29; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        dataMap[dStr] = { date: dStr, displayDate: d.getDate() + '/' + (d.getMonth()+1), omzet: 0, handphone: 0 };
      }
  
      if (db) {
        Object.keys(db).forEach(dateKey => {
          if (dataMap[dateKey]) {
            const daySales = db[dateKey].sales || [];
            daySales.forEach(sale => {
              dataMap[dateKey].omzet += Number(sale.omzet);
              if (sale.category === 'HP Baru' || sale.category === 'HP Second') {
                dataMap[dateKey].handphone += Number(sale.units);
              }
            });
          }
        });
      }

    return Object.values(dataMap);
  }, [db]);

  const stockPieData = [
    { name: 'Handphone', value: (activeData.stockCondition.hpBaru || 0) + (activeData.stockCondition.hpSecond || 0) },
  ];

  const recentSalesCols = [
    { header: 'Kategori', accessor: 'category', render: (val) => (val === 'HP Baru' || val === 'HP Second') ? 'Handphone' : val },
    { header: 'Unit', accessor: 'units', align: 'center' },
    { header: 'Omzet', accessor: 'omzet', align: 'right', render: (val) => <MoneyText value={val} /> },
    { header: 'Profit Kotor', accessor: 'profit', align: 'right', render: (val) => <MoneyText value={val} showColor /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Dashboard Utama" 
        subtitle={`Ringkasan bisnis Anda untuk tanggal ${formatDate(activeDate)}.`} 
      />

      {(isAgingCritical || isCashflowCritical) && (
        <div className="space-y-3">
          {isAgingCritical && (
            <AlertBox 
              type="warning" 
              title="Perhatian: Stok Aging" 
              message={`Stok >60 hari sudah mencapai ${formatRupiah(activeData.stockAging['>60'])}. Cashflow mungkin mulai berat.`}
            />
          )}
          {isCashflowCritical && (
            <AlertBox 
              type="error" 
              title="Kritis: Posisi Keuangan" 
              message={`Total uang aktif (${formatRupiah(activeUang)}) lebih kecil dari tagihan aktif (${formatRupiah(activeTagihan)}). Harap segera atur strategi pembayaran.`}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard 
          title="Total Omzet" 
          value={activeOmzet} 
          icon={DollarSign} 
          trend={activeOmzet - prevOmzet} 
          color="brand" 
          trendLabel="kemarin" 
        />
        <SummaryCard 
          title="Total Profit Kotor" 
          value={activeProfit} 
          icon={TrendingUp} 
          trend={activeProfit - prevProfit} 
          color="emerald" 
          trendLabel="kemarin" 
        />
        <SummaryCard 
          title="Total Unit Terjual" 
          value={activeUnits} 
          icon={Package} 
          trend={activeUnits - calculateTotal(previousData.sales, 'units')} 
          isCurrency={false}
          color="blue" 
          trendLabel="kemarin" 
        />
        <SummaryCard 
          title="Total Nilai Stok" 
          value={activeStok} 
          icon={Package} 
          color="indigo" 
          subtitle="Berdasarkan data hari ini" 
        />
        <SummaryCard 
          title="Total Uang Aktif" 
          value={activeUang} 
          icon={Wallet} 
          trend={activeUang - prevUang} 
          color="emerald" 
          trendLabel="kemarin" 
        />
        <SummaryCard 
          title="Total Tagihan Aktif" 
          value={activeTagihan} 
          icon={CreditCard} 
          trend={activeTagihan - prevTagihan} 
          color="red" 
          trendLabel="kemarin" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Trend Omzet (30 Hari Terakhir)">
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

        <ChartCard title="Unit Handphone Terjual (30 Hari Terakhir)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData30Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="handphone" name="Handphone" fill="#14b8a6" radius={[4, 4, 0, 0]} />
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

        <SectionCard title="Daftar Penjualan">
          <PremiumTable 
            columns={recentSalesCols} 
            data={activeData.sales} 
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default Dashboard;
