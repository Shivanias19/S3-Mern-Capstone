import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { format, isValid } from 'date-fns';
import {
  MdDevices,
  MdVerified,
  MdBuild,
  MdTimeline,
  MdAddBox,
  MdArrowForward,
  MdTrendingUp,
  MdWarning,
} from 'react-icons/md';

const categoryIcons = {
  Smartphone: '📱', Laptop: '💻', Tablet: '📟', Desktop: '🖥️',
  TV: '📺', Appliance: '🏠', Camera: '📷', Audio: '🎧',
  Gaming: '🎮', Wearable: '⌚', Other: '📦',
};

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`stat-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800 font-outfit">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shadow-sm`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const formatDate = (d) => {
    const date = new Date(d);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
  };

  if (loading) return <div className="p-8"><PageLoader /></div>;
  if (error) return <div className="p-8"><ErrorMessage message={error} onRetry={fetchStats} /></div>;

  const statCards = [
    {
      icon: MdDevices,
      label: 'Total Products',
      value: stats.totalProducts,
      sub: 'registered in system',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: MdVerified,
      label: 'Under Warranty',
      value: stats.activeWarranty,
      sub: `${stats.expiringSoon} expiring within 30 days`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: MdWarning,
      label: 'Needing Repair',
      value: stats.needingRepair,
      sub: 'active in-progress repairs',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: MdTimeline,
      label: 'Repair Records',
      value: stats.totalRepairs,
      sub: 'across all products',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Dashboard</h1>
            <p className="text-slate-500 mt-1">Smart Product Passport Overview</p>
          </div>
          <Link
            to="/register"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            <MdAddBox className="text-xl" />
            Register Product
          </Link>
        </div>

        {/* Banner */}
        <div
          className="mt-6 rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f1a6b 0%, #1530ab 60%, #0d9488 100%)' }}
        >
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-1 flex items-center gap-2">
              <MdTrendingUp /> System Status
            </p>
            <h2 className="text-2xl font-bold font-outfit">All Systems Operational</h2>
            <p className="text-blue-200 text-sm mt-1">
              {stats.expiredWarranty > 0
                ? `${stats.expiredWarranty} product${stats.expiredWarranty > 1 ? 's' : ''} with expired warranty.`
                : 'All warranties are current or active.'}
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-10">🛡️</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-in-up">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg font-outfit">Recently Registered</h2>
            <p className="text-slate-500 text-sm">Latest products added to the system</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-teal-600 text-sm font-medium hover:text-teal-700 transition-colors"
          >
            View all <MdArrowForward />
          </Link>
        </div>

        {stats.recentProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-slate-500 font-medium">No products registered yet</p>
            <Link to="/register" className="mt-3 inline-block text-teal-600 text-sm hover:underline">
              Register your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Warranty</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentProducts.map((product) => {
                  const warrantyOk = new Date(product.warrantyExpiry) > new Date();
                  return (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{categoryIcons[product.category] || '📦'}</span>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                            <p className="text-slate-400 text-xs">{product.brand} · {product.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{product.serialNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(product.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          warrantyOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {warrantyOk ? '✓ Active' : '✕ Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/products/${product._id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 text-sm font-medium flex items-center gap-1 justify-end"
                        >
                          View <MdArrowForward />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
