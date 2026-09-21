import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import Alert from '../components/ui/Alert';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const [sumRes, trendRes, expRes] = await Promise.all([
          api.get(`/expenses/summary?month=${monthStr}`),
          api.get('/expenses/trend?months=6'),
          api.get('/expenses?limit=5')
        ]);
        
        setSummary(sumRes.data);
        setTrend(trendRes.data);
        setRecent(expRes.data.items);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <Alert message={error} />;
  if (!summary) return null;

  const percentUsed = summary.budget > 0 ? (summary.total / summary.budget) * 100 : 0;
  let progressColor = 'bg-green-500';
  if (percentUsed >= 100) progressColor = 'bg-red-500';
  else if (percentUsed >= 80) progressColor = 'bg-yellow-500';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Spent This Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">${summary.total.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Budget Remaining</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">${Math.max(0, summary.remaining).toFixed(2)}</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
          </div>
          <p className="mt-1 text-xs text-gray-500">{percentUsed.toFixed(1)}% of ${summary.budget} used</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Spend by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={summary.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {summary.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
          <h3 className="text-sm font-medium text-gray-500 mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium">Recent Expenses</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {recent.map(exp => (
            <li key={exp._id} className="px-4 py-4 flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{exp.category}</p>
                <p className="text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()} - {exp.note}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">${exp.amount.toFixed(2)}</p>
            </li>
          ))}
          {recent.length === 0 && <li className="px-4 py-4 text-sm text-gray-500">No recent expenses found.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
