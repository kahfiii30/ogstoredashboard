import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotal } from '../utils/calculations';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SummaryCard from '../components/SummaryCard';
import PremiumTable from '../components/PremiumTable';
import MoneyText from '../components/MoneyText';
import Badge from '../components/Badge';
import AlertBox from '../components/AlertBox';
import ConfirmModal from '../components/ConfirmModal';
import { AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { AlertTriangle } from 'lucide-react';

const Bills = () => {
  const { activeData, updateActiveData, activeDate } = useApp();
  const bills = activeData.bills || [];
  
  const [formData, setFormData] = useState({
    id: '',
    distributor: '',
    due_date: '',
    amount: '',
    status: 'Belum Dibayar',
    notes: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const billData = {
      id: isEditing ? formData.id : Date.now().toString(),
      distributor: formData.distributor,
      due_date: formData.due_date,
      amount: parseNumber(formData.amount),
      status: formData.status,
      notes: formData.notes
    };

    let newBills;
    if (isEditing) {
      newBills = bills.map(b => b.id === formData.id ? billData : b);
      setIsEditing(false);
    } else {
      newBills = [billData, ...bills];
    }
    
    updateActiveData('bills', newBills);
    
    setFormData({
      id: '', distributor: '', due_date: '', amount: '', status: 'Belum Dibayar', notes: ''
    });
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setIsEditing(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newBills = bills.filter(b => b.id !== itemToDelete.id);
      updateActiveData('bills', newBills);
      setItemToDelete(null);
    }
  };

  const activeBills = bills.filter(b => b.status !== 'Lunas');
  const totalActive = calculateTotal(activeBills, 'amount');

  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Highlight if due in < 3 days
  const urgentBills = activeBills.filter(b => {
    const dueDate = new Date(b.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });

  const columns = [
    { header: 'Distributor', accessor: 'distributor', render: (val, row) => (
      <div className="flex items-center font-medium">
        {val}
        {urgentBills.some(ub => ub.id === row.id) && (
          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
        )}
      </div>
    )},
    { header: 'Jatuh Tempo', accessor: 'due_date', render: (val, row) => {
        const isUrgent = urgentBills.some(ub => ub.id === row.id);
        if (isUrgent) {
           return <Badge color="red">{formatDate(val)}</Badge>;
        }
        return <Badge color="slate">{formatDate(val)}</Badge>;
    }},
    { header: 'Nominal', accessor: 'amount', align: 'right', render: (val) => <MoneyText value={val} /> },
    { header: 'Status', accessor: 'status', render: (val) => (
      <Badge color={
        val === 'Lunas' ? 'emerald' :
        val === 'Sebagian' ? 'amber' :
        'red'
      }>
        {val}
      </Badge>
    )},
    { header: 'Catatan', accessor: 'notes', render: (val) => <span className="text-slate-500 italic text-xs">{val || '-'}</span> },
    { 
      header: 'Aksi', 
      accessor: 'id', 
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">Hapus</button>
        </div>
      ) 
    }
  ];

  // Sort bills: unpaid first, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.status !== 'Lunas' && b.status === 'Lunas') return -1;
    if (a.status === 'Lunas' && b.status !== 'Lunas') return 1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const totalLunas = calculateTotal(bills.filter(b => b.status === 'Lunas'), 'amount');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Tagihan / Tempo" 
        subtitle="Kelola hutang distributor dan jatuh tempo."
        dateLabel={`Tanggal: ${formatDate(activeDate)}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard 
          title="Total Tagihan Aktif (Belum Lunas)" 
          value={totalActive} 
          icon={CreditCard} 
          color="red" 
        />
        <SummaryCard 
          title="Total Tagihan Lunas" 
          value={totalLunas} 
          icon={CheckCircle} 
          color="emerald" 
        />
      </div>

      {urgentBills.length > 0 && (
        <AlertBox 
          type="error"
          title="Perhatian: Tagihan Segera Jatuh Tempo"
          message={`Terdapat ${urgentBills.length} tagihan yang akan jatuh tempo dalam 3 hari ke depan atau sudah lewat.`}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <SectionCard title={isEditing ? 'Edit Tagihan' : 'Tambah Tagihan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Distributor</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.distributor}
                  onChange={e => setFormData({...formData, distributor: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jatuh Tempo</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="input-field"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Belum Dibayar">Belum Dibayar</option>
                  <option value="Sebagian">Sebagian</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                <textarea 
                  className="input-field"
                  rows="2"
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {isEditing ? 'Simpan' : 'Tambah'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        id: '', distributor: '', due_date: '', amount: '', status: 'Belum Dibayar', notes: ''
                      });
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </SectionCard>
        </div>

        <div className="xl:col-span-2">
          <SectionCard title="Daftar Tagihan">
            <PremiumTable 
              columns={columns} 
              data={sortedBills} 
            />
          </SectionCard>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Tagihan"
        message="Apakah Anda yakin ingin menghapus tagihan distributor ini? Data yang dihapus tidak dapat dikembalikan."
      />
    </div>
  );
};

export default Bills;
