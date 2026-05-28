import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailySales from './pages/DailySales';
import SalesRecap from './pages/SalesRecap';
import StockAging from './pages/StockAging';
import Bills from './pages/Bills';
import StockCondition from './pages/StockCondition';
import CashPosition from './pages/CashPosition';
import Reports from './pages/Reports';
import SalesPerformance from './pages/SalesPerformance';

import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="daily-sales" element={<DailySales />} />
            <Route path="sales-recap" element={<SalesRecap />} />
            <Route path="stock-aging" element={<StockAging />} />
            <Route path="bills" element={<Bills />} />
            <Route path="stock-condition" element={<StockCondition />} />
            <Route path="cash-position" element={<CashPosition />} />
            <Route path="reports" element={<Reports />} />
            <Route path="sales-performance" element={<SalesPerformance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
