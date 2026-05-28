export const calculateTotal = (data, key) => {
  return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
};

export const calculateMargin = (profit, omzet) => {
  if (!omzet || omzet === 0) return 0;
  return ((profit / omzet) * 100).toFixed(1);
};

export const calculateTotalUangAktif = (cashPosition) => {
  return Object.values(cashPosition).reduce((sum, val) => sum + (Number(val) || 0), 0);
};

export const calculateTotalStok = (stockCondition) => {
  return Object.values(stockCondition).reduce((sum, val) => sum + (Number(val) || 0), 0);
};

// Filter helpers
export const filterSalesByDateRange = (sales, startDate, endDate) => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    // Set hours to 0 to compare just dates
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return saleDate >= start && saleDate <= end;
  });
};

export const filterSalesByCategory = (sales, category) => {
  if (!category || category === 'Semua') return sales;
  return sales.filter(sale => sale.category === category);
};
