import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { MdSearch, MdFilterList, MdAddBox, MdDevices } from 'react-icons/md';

const CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'TV', 'Appliance', 'Camera', 'Audio', 'Gaming', 'Wearable', 'Other'];
const WARRANTY_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Under Warranty' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (warrantyStatus) params.warrantyStatus = warrantyStatus;
      params.limit = 100;
      const res = await getProducts(params);
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, category, warrantyStatus]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">Products</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link
          to="/register"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
        >
          <MdAddBox className="text-xl" />
          Register Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 fade-in-up">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name, brand, serial number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Warranty status filter */}
          <div>
            <select
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white appearance-none cursor-pointer"
            >
              {WARRANTY_STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(search || category || warrantyStatus) && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setCategory(''); setWarrantyStatus(''); }}
              className="px-4 py-2.5 text-slate-500 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center fade-in-up">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <MdDevices className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-bold text-xl mb-2">No products found</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            {search || category || warrantyStatus
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by registering your first product.'}
          </p>
          {!search && !category && !warrantyStatus && (
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
            >
              Register First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <div key={product._id} style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
