import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumber, formatDate } from '../utils/format';
import { calculateTotal } from '../utils/calculations';
import DataTable from '../components/DataTable';
import AlertBox from '../components/AlertBox';
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
      <div className="flex items-center">
        {val}
        {urgentBills.some(ub => ub.id === row.id) && (
          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
        )}
      </div>
    )},
    { header: 'Jatuh Tempo', accessor: 'due_date', render: (val, row) => {
        const isUrgent = urgentBills.some(ub => ub.id === row.id);
        return <span className={isUrgent ? 'text-red-600 font-bold' : ''}>{formatDate(val)}</span>;
    }},
    { header: 'Nominal', accessor: 'amount', render: (val) => formatRupiah(val) },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        val === 'Lunas' ? 'bg-emerald-100 text-emerald-700' :
        val === 'Sebagian' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>
        {val}
      </span>
    )},
    { header: 'Catatan', accessor: 'notes' },
  ];

  // Sort bills: unpaid first, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.status !== 'Lunas' && b.status === 'Lunas') return -1;
    if (a.status === 'Lunas' && b.status !== 'Lunas') return 1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tagihan / Tempo</h1>
        <p className="text-slate-500">Kelola hutang distributor dan jatuh tempo untuk tanggal <span className="font-bold text-brand-600">{formatDate(activeDate)}</span>.</p>
      </div>

      <div className="card p-6 bg-red-50 border-red-200">
        <p className="text-sm font-medium text-red-600 mb-1">Total Tagihan Aktif (Belum Lunas)</p>
        <h3 className="text-3xl font-bold text-red-900">{formatRupiah(totalActive)}</h3>
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
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditing ? 'Edit Tagihan' : 'Tambah Tagihan'}
            </h3>
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
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Tagihan</h3>
            <DataTable 
              columns={columns} 
              data={sortedBills} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
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
