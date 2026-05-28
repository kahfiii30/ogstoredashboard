import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
    if (!error && data) {
      setSales(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const addSale = async (newSale) => {
    const { data, error } = await supabase.from('sales').insert([newSale]).select();
    if (!error && data) {
      setSales([data[0], ...sales]);
    }
  };

  const updateSale = async (id, updatedSale) => {
    const { data, error } = await supabase.from('sales').update(updatedSale).eq('id', id).select();
    if (!error && data) {
      setSales(sales.map(s => s.id === id ? data[0] : s));
    }
  };

  const deleteSale = async (id) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  return { sales, loading, addSale, updateSale, deleteSale, refresh: fetchSales };
}

export function useBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('bills').select('*').order('due_date', { ascending: true });
    if (!error && data) {
      setBills(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const addBill = async (newBill) => {
    const { data, error } = await supabase.from('bills').insert([newBill]).select();
    if (!error && data) {
      setBills([...bills, data[0]]);
    }
  };

  const updateBill = async (id, updatedBill) => {
    const { data, error } = await supabase.from('bills').update(updatedBill).eq('id', id).select();
    if (!error && data) {
      setBills(bills.map(b => b.id === id ? data[0] : b));
    }
  };

  const deleteBill = async (id) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (!error) {
      setBills(bills.filter(b => b.id !== id));
    }
  };

  return { bills, loading, addBill, updateBill, deleteBill, refresh: fetchBills };
}

export function useConfigData(tableName, defaultState) {
  const [data, setData] = useState(defaultState);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: dbData, error } = await supabase.from(tableName).select('*');
    if (!error && dbData && dbData.length > 0) {
      const formatted = {};
      dbData.forEach(row => {
        formatted[row.category] = Number(row.amount);
      });
      setData(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  const updateData = async (newData) => {
    setData(newData); // Optimistic update
    for (const [key, value] of Object.entries(newData)) {
      await supabase.from(tableName).update({ amount: value, updated_at: new Date() }).eq('category', key);
    }
  };

  return { data, loading, updateData, refresh: fetchData };
}
