import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Alert from '../components/ui/Alert';
import ExpenseModal from '../components/ExpenseModal';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (category) params.category = category;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.items);
      setPages(res.data.pages);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, category, from, to]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSave = async (expenseData) => {
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, expenseData);
      } else {
        await api.post('/expenses', expenseData);
      }
      setModalOpen(false);
      setPage(1); // Reset to first page
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const openAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditingExpense(exp);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button onClick={openAdd} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add Expense</button>
      </div>
      
      <Alert message={error} />
      
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select className="border-gray-300 rounded text-sm px-3 py-2 border" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
          <input type="date" className="border-gray-300 rounded text-sm px-3 py-2 border" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
          <input type="date" className="border-gray-300 rounded text-sm px-3 py-2 border" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No expenses found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(exp => (
                  <tr key={exp._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exp.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{exp.note}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button onClick={() => openEdit(exp)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(exp._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">Previous</button>
          <span className="px-4 py-1 text-sm text-gray-700">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">Next</button>
        </div>
      )}

      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} expense={editingExpense} />
    </div>
  );
};
export default Expenses;
