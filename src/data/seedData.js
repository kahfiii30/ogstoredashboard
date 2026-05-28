export const seedSales = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    category: 'HP Baru',
    units: 12,
    omzet: 98000000,
    profit: 5400000,
    notes: 'Penjualan normal, termasuk PO S24',
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    category: 'HP Second',
    units: 18,
    omzet: 143000000,
    profit: 14700000,
    notes: 'Banyak laku iPhone ex inter',
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    category: 'Aksesoris',
    units: 31,
    omzet: 9500000,
    profit: 4200000,
    notes: 'Charger dan case laris',
  }
];

// Provide some historical data for the 30 days charts
const generateHistoricalData = () => {
  const data = [];
  const today = new Date();
  for (let i = 30; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Randomize some sales
    const hpBaruUnits = Math.floor(Math.random() * 15) + 5;
    const hpSecondUnits = Math.floor(Math.random() * 20) + 5;
    const aksesorisUnits = Math.floor(Math.random() * 40) + 10;
    
    data.push({
      id: `hist-baru-${i}`,
      date: dateString,
      category: 'HP Baru',
      units: hpBaruUnits,
      omzet: hpBaruUnits * 8000000,
      profit: hpBaruUnits * 400000,
      notes: '-',
    });
    data.push({
      id: `hist-sec-${i}`,
      date: dateString,
      category: 'HP Second',
      units: hpSecondUnits,
      omzet: hpSecondUnits * 6000000,
      profit: hpSecondUnits * 700000,
      notes: '-',
    });
    data.push({
      id: `hist-aks-${i}`,
      date: dateString,
      category: 'Aksesoris',
      units: aksesorisUnits,
      omzet: aksesorisUnits * 150000,
      profit: aksesorisUnits * 80000,
      notes: '-',
    });
  }
  return data;
};

export const historicalSales = generateHistoricalData();

export const seedStockAging = {
  '0-14': 2100000000,
  '15-30': 1300000000,
  '31-60': 700000000,
  '>60': 330000000,
};

// Adjust dates relative to today
const today = new Date();
const date27 = new Date(today.getFullYear(), 4, 27); // May 27 (0-indexed month)
const date29 = new Date(today.getFullYear(), 4, 29); // May 29
const date1 = new Date(today.getFullYear(), 5, 1);   // June 1

export const seedBills = [
  {
    id: '1',
    distributor: 'TAM',
    dueDate: date27.toISOString().split('T')[0],
    amount: 320000000,
    status: 'Belum Dibayar',
    notes: 'Tagihan bulan April',
  },
  {
    id: '2',
    distributor: 'SES',
    dueDate: date29.toISOString().split('T')[0],
    amount: 180000000,
    status: 'Belum Dibayar',
    notes: 'Sisa tagihan',
  },
  {
    id: '3',
    distributor: 'Erajaya',
    dueDate: date1.toISOString().split('T')[0],
    amount: 410000000,
    status: 'Belum Dibayar',
    notes: 'Batch 3',
  }
];

export const seedStockCondition = {
  hpBaru: 2400000000,
  hpSecond: 1850000000,
  aksesoris: 180000000,
};

export const seedCashPosition = {
  cash: 85000000,
  bank: 214500000,
  ewallet: 12300000,
  piutang: 43000000,
};
