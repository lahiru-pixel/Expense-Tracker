import { useState, useEffect } from 'react';
import api from '../api/axios';
import Alert from '../components/ui/Alert';

const Budget = () => {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [month, setMonth] = useState(currentMonthStr);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBudget = async (m) => {
      try {
        const res = await api.get(`/budget?month=${m}`);
        setAmount(res.data.amount || '');
      } catch (err) {
        setError('Failed to fetch budget');
      }
    };
    fetchBudget(month);
  }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/budget', { month, amount: Number(amount) });
      setSuccess('Budget saved successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Budget</h1>
      <Alert message={error} />
      {success && <Alert message={success} type="success" />}
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month (YYYY-MM)</label>
            <input type="month" required value={month} onChange={e => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Amount ($)</label>
            <input type="number" required min="0" step="1" value={amount} onChange={e => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Budget;
