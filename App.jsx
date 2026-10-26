import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import RegisterProduct from './pages/RegisterProduct';
import ProductDetail from './pages/ProductDetail';
import AddRepair from './pages/AddRepair';
import PublicPassport from './pages/PublicPassport';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />
      <Routes>
        {/* Public passport – no sidebar */}
        <Route path="/passport/:id" element={<PublicPassport />} />

        {/* Admin routes with sidebar */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/:id/add-repair" element={<AddRepair />} />
                <Route path="/register" element={<RegisterProduct />} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-96 p-8 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-2">Page Not Found</h2>
                    <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
                    <a href="/" className="px-5 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium">
                      Go to Dashboard
                    </a>
                  </div>
                } />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
