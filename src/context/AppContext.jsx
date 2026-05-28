import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getPreviousAvailableDate, createDailyDataFromPrevious } from '../utils/dailyData';

const AppContext = createContext();

const defaultDayData = {
  sales: [],
  stockAging: { '0-14': 0, '15-30': 0, '31-60': 0, '>60': 0 },
  bills: [],
  stockCondition: { hpBaru: 0, hpSecond: 0, aksesoris: 0 },
  cashPosition: { cash: 0, bank: 0, ewallet: 0, piutang: 0 },
  salesPerformance: []
};

export const AppProvider = ({ children }) => {
  const [activeDate, setActiveDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [db, setDb] = useLocalStorage('og_store_daily_db', null);
  
  // Migration & Seeding Logic
  useEffect(() => {
    if (!db) {
      // Create initial DB structure with seed data
      const initialDb = {
        "2026-05-26": { 
          ...defaultDayData, 
          sales: [
            {id: '1', date: '2026-05-26', category: 'HP Baru', units: 10, omzet: 15000000, profit: 1000000, notes: 'Seed 26'}
          ],
          bills: [
            {id: 'b1', distributor: 'PT Sumber Makmur', due_date: '2026-06-01', amount: 50000000, status: 'Belum Dibayar', notes: ''}
          ],
          cashPosition: { cash: 5000000, bank: 20000000, ewallet: 1500000, piutang: 0 },
          salesPerformance: [
            { id: 'sp1', name: 'Aldi', unit: 8, profit: 3900000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp2', name: 'Rian', unit: 6, profit: 1800000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp3', name: 'Dika', unit: 2, profit: 500000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp4', name: 'Sinta', unit: 10, profit: 4700000, note: '', createdAt: new Date().toISOString() }
          ]
        },
        "2026-05-27": { 
          ...defaultDayData, 
          sales: [
            {id: '2', date: '2026-05-27', category: 'HP Baru', units: 15, omzet: 20000000, profit: 1500000, notes: 'Seed 27'},
            {id: '3', date: '2026-05-27', category: 'Aksesoris', units: 30, omzet: 3000000, profit: 1500000, notes: 'Charger'}
          ],
          bills: [
            {id: 'b2', distributor: 'PT Bintang Terang', due_date: '2026-06-05', amount: 57000000, status: 'Belum Dibayar', notes: ''}
          ],
          stockCondition: { hpBaru: 150000000, hpSecond: 40000000, aksesoris: 5000000 },
          cashPosition: { cash: 8000000, bank: 35000000, ewallet: 2500000, piutang: 0 },
          salesPerformance: [
            { id: 'sp5', name: 'Aldi', unit: 9, profit: 4600000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp6', name: 'Rian', unit: 5, profit: 1500000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp7', name: 'Dika', unit: 4, profit: 900000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp8', name: 'Sinta', unit: 12, profit: 5500000, note: '', createdAt: new Date().toISOString() }
          ]
        },
        "2026-05-28": { 
          ...defaultDayData, 
          sales: [
            {id: '4', date: '2026-05-28', category: 'HP Second', units: 5, omzet: 5000000, profit: 500000, notes: 'Seed 28'}
          ],
          bills: [
            {id: 'b3', distributor: 'PT Maju Jaya', due_date: '2026-06-10', amount: 76000000, status: 'Belum Dibayar', notes: ''}
          ],
          stockCondition: { hpBaru: 120000000, hpSecond: 45000000, aksesoris: 4500000 },
          cashPosition: { cash: 12000000, bank: 40000000, ewallet: 3000000, piutang: 1000000 },
          salesPerformance: [
            { id: 'sp9', name: 'Aldi', unit: 11, profit: 5300000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp10', name: 'Rian', unit: 7, profit: 2100000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp11', name: 'Dika', unit: 3, profit: 700000, note: '', createdAt: new Date().toISOString() },
            { id: 'sp12', name: 'Sinta', unit: 14, profit: 6400000, note: '', createdAt: new Date().toISOString() }
          ]
        },
      };
      setDb(initialDb);
    } else {
      // MIGRATION: Fix copied sales that have wrong dates
      let needsUpdate = false;
      const newDb = { ...db };
      Object.keys(newDb).forEach(dateKey => {
        if (newDb[dateKey].sales) {
          let modified = false;
          newDb[dateKey].sales = newDb[dateKey].sales.map(s => {
            if (s.date !== dateKey) {
              modified = true;
              return { ...s, date: dateKey };
            }
            return s;
          });
          if (modified) needsUpdate = true;
        }
        if (newDb[dateKey].salesPerformance) {
          let modified = false;
          if (dateKey !== '2026-05-26' && dateKey !== '2026-05-27' && dateKey !== '2026-05-28') {
             newDb[dateKey].salesPerformance = newDb[dateKey].salesPerformance.map(s => {
               if (!s.createdAt || !s.createdAt.startsWith(dateKey)) {
                 modified = true;
                 return { ...s, createdAt: dateKey + 'T00:00:00.000Z' };
               }
               return s;
             });
             if (modified) needsUpdate = true;
          }
        }
      });

      // MIGRATION: Propagate bills forward (fix for missing seed data accumulation)
      const sortedDates = Object.keys(newDb).sort();
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i-1];
        const currDate = sortedDates[i];
        const prevBills = newDb[prevDate].bills || [];
        const currBills = newDb[currDate].bills || [];
        
        let billsChanged = false;
        const newCurrBills = [...currBills];
        
        prevBills.forEach(pb => {
          // Jika bill dari hari sebelumnya tidak ada di hari ini, tambahkan
          if (!newCurrBills.find(cb => cb.id === pb.id)) {
            newCurrBills.push(pb);
            billsChanged = true;
          }
        });
        
        if (billsChanged) {
          newDb[currDate].bills = newCurrBills;
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        setDb(newDb);
      }
    }
  }, [db, setDb]);

  // Auto-copy data when navigating to a date without data
  useEffect(() => {
    if (db && !db[activeDate]) {
      const prevDate = getPreviousAvailableDate(activeDate, db);
      if (prevDate) {
        setDb(prev => {
          if (prev[activeDate]) return prev; // race condition check
          const newDb = { ...prev };
          newDb[activeDate] = createDailyDataFromPrevious(activeDate, prevDate, prev, defaultDayData);
          return newDb;
        });
      }
    }
  }, [activeDate, db, setDb]);

  const updateDailyData = (date, key, data) => {
    setDb(prev => {
      const newDb = { ...(prev || {}) };
      if (!newDb[date]) {
        const prevDate = getPreviousAvailableDate(date, prev);
        if (prevDate) {
          newDb[date] = createDailyDataFromPrevious(date, prevDate, prev, defaultDayData);
        } else {
          newDb[date] = JSON.parse(JSON.stringify(defaultDayData));
        }
      }
      newDb[date][key] = data;
      // update meta updatedAt if exists
      if (newDb[date].meta) {
        newDb[date].meta.updatedAt = new Date().toISOString();
      }
      return newDb;
    });
  };

  const getDailyData = (date) => {
    if (db?.[date]) return db[date];
    
    // Fallback if not yet created by useEffect
    if (db) {
       const prevDate = getPreviousAvailableDate(date, db);
       if (prevDate) {
         return createDailyDataFromPrevious(date, prevDate, db, defaultDayData);
       }
    }
    
    return JSON.parse(JSON.stringify(defaultDayData));
  };

  const activeData = useMemo(() => getDailyData(activeDate), [activeDate, db]);
  
  // Helper for previous day comparison
  const previousDate = useMemo(() => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, [activeDate]);
  
  const previousData = useMemo(() => getDailyData(previousDate), [previousDate, db]);

  // Expose convenient methods to update active data directly
  const updateActiveData = (key, data) => {
    updateDailyData(activeDate, key, data);
  };

  return (
    <AppContext.Provider value={{
      activeDate,
      setActiveDate,
      activeData,
      previousData,
      updateDailyData,
      updateActiveData,
      db,
      defaultDayData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
