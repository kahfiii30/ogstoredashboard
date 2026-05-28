import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getPreviousAvailableDate, createDailyDataFromPrevious } from '../utils/dailyData';
import { supabase } from '../lib/supabase';

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

  const [db, setDbState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Custom setDb that updates local state and syncs to Supabase
  const setDb = useCallback(async (newDbOrUpdater) => {
    setDbState(prev => {
      const nextDb = typeof newDbOrUpdater === 'function' ? newDbOrUpdater(prev) : newDbOrUpdater;
      
      // Sync to supabase in background (debounce or direct)
      // Since nextDb is the whole DB, we figure out what changed, or we just upload all keys
      // A more optimized way is just to push everything or push specific dates.
      // But for simplicity, we just push all keys to Supabase when setDb is called.
      // In practice, updateDailyData handles the specific day upsert.
      return nextDb;
    });
  }, []);

  const syncDateToSupabase = async (date, data) => {
    try {
      await supabase.from('daily_snapshots').upsert({ date, data });
    } catch (err) {
      console.error('Failed to sync to Supabase', err);
    }
  };

  // Initialization: Fetch from Supabase, fallback to LocalStorage Migration
  useEffect(() => {
    const initDb = async () => {
      try {
        const { data, error } = await supabase.from('daily_snapshots').select('*');
        if (error) throw error;

        if (data && data.length > 0) {
          // Supabase has data, load it
          const loadedDb = {};
          data.forEach(row => {
            loadedDb[row.date] = row.data;
          });
          setDbState(loadedDb);
        } else {
          // Supabase is empty! Migrate from LocalStorage
          const localDbStr = localStorage.getItem('og_store_daily_db');
          if (localDbStr) {
            const localDb = JSON.parse(localDbStr);
            setDbState(localDb);
            // Upload all local data to Supabase
            const promises = Object.keys(localDb).map(dateKey => 
              supabase.from('daily_snapshots').upsert({ date: dateKey, data: localDb[dateKey] })
            );
            await Promise.all(promises);
            console.log("Migrated local storage to Supabase successfully.");
          } else {
            // Completely fresh
            setDbState({});
          }
        }
      } catch (err) {
        console.error("Error initializing DB:", err);
        // Fallback to local storage on error
        const localDbStr = localStorage.getItem('og_store_daily_db');
        if (localDbStr) {
          setDbState(JSON.parse(localDbStr));
        } else {
          setDbState({});
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initDb();
  }, []);

  // Migration & Seeding Logic (same as before, runs after load)
  useEffect(() => {
    if (isInitializing || !db || Object.keys(db).length === 0) return;

    let needsUpdate = false;
    const newDb = { ...db };
    
    // Fix copied sales that have wrong dates
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

    // MIGRATION: Propagate bills forward
    const sortedDates = Object.keys(newDb).sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i-1];
      const currDate = sortedDates[i];
      const prevBills = newDb[prevDate].bills || [];
      const currBills = newDb[currDate].bills || [];
      
      let billsChanged = false;
      const newCurrBills = [...currBills];
      
      prevBills.forEach(pb => {
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
      setDbState(newDb);
      // Sync all changed dates to supabase
      Object.keys(newDb).forEach(dateKey => {
        syncDateToSupabase(dateKey, newDb[dateKey]);
      });
    }
  }, [db, isInitializing]);

  // Auto-copy data when navigating to a date without data
  useEffect(() => {
    if (isInitializing || !db) return;
    
    if (!db[activeDate]) {
      const prevDate = getPreviousAvailableDate(activeDate, db);
      if (prevDate) {
        setDbState(prev => {
          if (prev[activeDate]) return prev; // race condition check
          const newDb = { ...prev };
          newDb[activeDate] = createDailyDataFromPrevious(activeDate, prevDate, prev, defaultDayData);
          
          // Sync new day to Supabase
          syncDateToSupabase(activeDate, newDb[activeDate]);
          
          return newDb;
        });
      }
    }
  }, [activeDate, db, isInitializing]);

  const updateDailyData = (date, key, data) => {
    setDbState(prev => {
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
      
      // Sync this specific day to Supabase
      syncDateToSupabase(date, newDb[date]);
      
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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Sinkronisasi Cloud...</p>
        </div>
      </div>
    );
  }

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
