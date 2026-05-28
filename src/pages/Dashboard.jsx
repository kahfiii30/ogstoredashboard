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
import SummaryCard from '../components/SummaryCard';
import ChartCard from '../components/ChartCard';
import AlertBox from '../components/AlertBox';
import DataTable from '../components/DataTable';

const COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444'];

const TrendIndicator = ({ current, previous, isCurrency = true }) => {
  const diff = current - previous;
  const isPositive = diff >= 0;
  
  if (previous === 0 && current === 0) return null;

  return (
    <div className={`flex items-center text-xs mt-2 font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
      <span>
        {isPositive ? 'Naik ' : 'Turun '}
        {isCurrency ? formatRupiah(Math.abs(diff)) : Math.abs(diff)}
        <span className="text-slate-400 ml-1 font-normal">dari {isCurrency ? formatRupiah(previous) : previous} kemarin</span>
      </span>
    </div>
  );
};

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
    { header: 'Unit', accessor: 'units' },
    { header: 'Omzet', accessor: 'omzet', render: (val) => formatRupiah(val) },
    { header: 'Profit Kotor', accessor: 'profit', render: (val) => formatRupiah(val) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
          <p className="text-slate-500">Ringkasan bisnis Anda untuk tanggal <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-5 border-brand-100 hover:border-brand-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Omzet</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeOmzet)}</p>
          <TrendIndicator current={activeOmzet} previous={prevOmzet} />
        </div>

        <div className="card p-5 bg-white border-emerald-100 hover:border-emerald-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Profit Kotor</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeProfit)}</p>
          <TrendIndicator current={activeProfit} previous={prevProfit} />
        </div>

        <div className="card p-5 bg-white border-blue-100 hover:border-blue-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Unit Terjual</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{activeUnits} Unit</p>
          <TrendIndicator current={activeUnits} previous={calculateTotal(previousData.sales, 'units')} isCurrency={false} />
        </div>

        <div className="card p-5 border-indigo-100 hover:border-indigo-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Package className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Nilai Stok</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeStok)}</p>
          <p className="text-xs text-slate-400 mt-2">Berdasarkan data hari ini</p>
        </div>

        <div className="card p-5 bg-white border-emerald-100 hover:border-emerald-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Uang Aktif</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeUang)}</p>
          <TrendIndicator current={activeUang} previous={prevUang} />
        </div>

        <div className="card p-5 border-red-100 hover:border-red-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Total Tagihan Aktif</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeTagihan)}</p>
          <TrendIndicator current={activeTagihan} previous={prevTagihan} />
        </div>

        <div className="card p-5 bg-white border-blue-100 hover:border-blue-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Performa Sales (Unit)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{activeSalesPerfUnit} Unit</p>
        </div>

        <div className="card p-5 bg-white border-emerald-100 hover:border-emerald-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Performa Sales (Profit)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(activeSalesPerfProfit)}</p>
        </div>

        <div className="card p-5 border-amber-100 hover:border-amber-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-600">Sales Terbaik (Profit)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 truncate">{bestSalesPerf ? bestSalesPerf.name : '-'}</p>
          <p className="text-xs text-slate-500 mt-2">{bestSalesPerf ? formatRupiah(bestSalesPerf.profit) : '-'}</p>
        </div>
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

        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Daftar Penjualan</h3>
              <p className="text-sm text-slate-500 mt-1">{formatDate(activeDate)}</p>
            </div>
          </div>
          <DataTable 
            columns={recentSalesCols} 
            data={activeData.sales} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
