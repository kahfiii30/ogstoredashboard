export const getPreviousAvailableDate = (targetDate, db) => {
  if (!db) return null;

  // Dapatkan semua tanggal yang ada di DB dan urutkan
  const availableDates = Object.keys(db).sort();
  
  // Cari tanggal terbesar yang masih lebih kecil dari targetDate
  let closestDate = null;
  for (let i = availableDates.length - 1; i >= 0; i--) {
    if (availableDates[i] < targetDate) {
      closestDate = availableDates[i];
      break;
    }
  }
  
  return closestDate;
};

export const createDailyDataFromPrevious = (targetDate, previousDate, db, defaultDayData) => {
  const previousData = db[previousDate];
  
  // Deep clone data sebelumnya
  let newData;
  if (typeof structuredClone === 'function') {
    newData = structuredClone(previousData);
  } else {
    newData = JSON.parse(JSON.stringify(previousData));
  }

  // Update dates on transactional data so they belong to the new date
  if (newData.sales && Array.isArray(newData.sales)) {
    newData.sales = newData.sales.map(s => ({ ...s, date: targetDate }));
  }
  if (newData.salesPerformance && Array.isArray(newData.salesPerformance)) {
    newData.salesPerformance = newData.salesPerformance.map(sp => ({ ...sp, createdAt: targetDate + 'T00:00:00.000Z' }));
  }

  // Tambahkan metadata clone
  newData.meta = {
    createdFromDate: previousDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return newData;
};
