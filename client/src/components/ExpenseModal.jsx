import { useState, useEffect } from 'react';

const ExpenseModal = ({ isOpen, onClose, onSave, expense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'];

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
      setNote(expense.note || '');
    } else {
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ amount: Number(amount), category, date, note });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium">{expense ? 'Edit Expense' : 'Add Expense'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" step="0.01" min="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select required value={category} onChange={e => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Note</label>
            <input type="text" maxLength="200" value={note} onChange={e => setNote(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ExpenseModal;
