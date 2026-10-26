import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductPassport } from '../api';
import { PageLoader } from '../components/LoadingSpinner';
import { format, isValid } from 'date-fns';
import { MdVerified, MdWarning, MdError, MdBuild, MdQrCode2, MdPrint, MdShield } from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';

const categoryIcons = {
  Smartphone: '📱', Laptop: '💻', Tablet: '📟', Desktop: '🖥️',
  TV: '📺', Appliance: '🏠', Camera: '📷', Audio: '🎧',
  Gaming: '🎮', Wearable: '⌚', Other: '📦',
};

const statusColors = {
  completed: 'bg-emerald-100 text-emerald-700', in_progress: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700',
};
const statusLabels = {
  completed: 'Completed', in_progress: 'In Progress', pending: 'Pending', cancelled: 'Cancelled',
};

export default function PublicPassport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductPassport(id)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (d) => {
    const date = new Date(d);
    return isValid(date) ? format(date, 'MMMM d, yyyy') : '—';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <PageLoader />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="text-2xl font-bold text-slate-800 font-outfit">Product Not Found</h1>
      <p className="text-slate-500">{error}</p>
      <Link to="/" className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm">
        Return to Dashboard
      </Link>
    </div>
  );

  const { product, repairs } = data;
  const passportUrl = `${window.location.origin}/passport/${product._id}`;
  const warrantyOk = new Date(product.warrantyExpiry) > new Date();
  const warrantyExpiringSoon = warrantyOk && product.warrantyDaysRemaining <= 30;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print header */}
      <div className="no-print sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdQrCode2 className="text-teal-600 text-xl" />
            <span className="font-bold text-slate-800 text-sm font-outfit">Smart Product Passport</span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/products/${product._id}`}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Admin View
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium hover:bg-teal-600 transition-colors"
            >
              <MdPrint className="text-sm" /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Passport header */}
        <div
          className="rounded-3xl p-8 text-white print-card"
          style={{ background: 'linear-gradient(135deg, #0f1a6b 0%, #1530ab 60%, #0d9488 100%)' }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{categoryIcons[product.category] || '📦'}</span>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Digital Product Passport</p>
                  <h1 className="text-3xl font-bold font-outfit">{product.name}</h1>
                  <p className="text-blue-200 mt-1">{product.brand} · {product.model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Serial Number</p>
                  <p className="font-mono text-sm bg-white/10 px-2 py-1 rounded-lg">{product.serialNumber}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Category</p>
                  <p className="text-white font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Purchase Date</p>
                  <p className="text-white font-medium">{fmt(product.purchaseDate)}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Warranty Status</p>
                  <div className="flex items-center gap-1">
                    {warrantyOk ? (
                      warrantyExpiringSoon ? (
                        <><MdWarning className="text-amber-400" /><span className="text-amber-400 font-semibold">Expiring Soon</span></>
                      ) : (
                        <><MdVerified className="text-emerald-400" /><span className="text-emerald-400 font-semibold">Active</span></>
                      )
                    ) : (
                      <><MdError className="text-red-400" /><span className="text-red-400 font-semibold">Expired</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-xl text-center">
              <QRCodeSVG
                value={passportUrl}
                size={140}
                fgColor="#0f172a"
                bgColor="#ffffff"
                level="M"
              />
              <p className="text-slate-400 text-xs mt-2">Scan for passport</p>
            </div>
          </div>
        </div>

        {/* Warranty details */}
        <div className={`rounded-2xl p-5 border print-card ${
          warrantyOk ? (warrantyExpiringSoon ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200') : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {warrantyOk ? (
              warrantyExpiringSoon ? <MdWarning className="text-amber-600 text-2xl" /> : <MdVerified className="text-emerald-600 text-2xl" />
            ) : <MdError className="text-red-600 text-2xl" />}
            <div>
              <p className={`font-bold ${warrantyOk ? (warrantyExpiringSoon ? 'text-amber-800' : 'text-emerald-800') : 'text-red-800'}`}>
                {warrantyOk ? (warrantyExpiringSoon ? 'Warranty Expiring Soon' : 'Product Under Warranty') : 'Warranty Expired'}
              </p>
              <p className={`text-sm ${warrantyOk ? (warrantyExpiringSoon ? 'text-amber-700' : 'text-emerald-700') : 'text-red-700'}`}>
                Expires on {fmt(product.warrantyExpiry)}
                {warrantyOk && ` · ${product.warrantyDaysRemaining} days remaining`}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 print-card">
            <h2 className="font-bold text-slate-800 mb-2 font-outfit">About This Product</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Repair History */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 print-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MdBuild className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 font-outfit">Service History</h2>
              <p className="text-slate-400 text-xs">{repairs.length} repair record{repairs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {repairs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No service records for this product.</p>
          ) : (
            <div className="space-y-4">
              {repairs.map((repair, idx) => (
                <div key={repair._id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-800 text-sm">{repair.problemDescription}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusColors[repair.serviceStatus]}`}>
                      {statusLabels[repair.serviceStatus]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    <span className="font-medium">Action:</span> {repair.repairAction}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>📅 {fmt(repair.repairDate)}</span>
                    <span>👨‍🔧 {repair.technicianName}</span>
                    <span>💰 ${repair.repairCost.toFixed(2)}</span>
                    {repair.replacedParts?.length > 0 && (
                      <span>🔩 {repair.replacedParts.join(', ')}</span>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-300 font-mono truncate">
                      #{repair.sequenceNumber} {repair.recordHash}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit notice */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 print-card">
          <div className="flex items-start gap-3">
            <MdShield className="text-purple-500 text-2xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 text-sm mb-1">Tamper-Evident Audit Chain</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Each service record in this passport is linked using SHA-256 cryptographic hashes.
                Any alteration to a record would break the chain and be detectable through audit verification.
                Note: hash verification confirms data integrity — it does not independently prove that repairs occurred in the physical world.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-slate-300 text-xs">
          Generated by Smart Product Passport · {fmt(new Date())}
        </div>
      </div>
    </div>
  );
}
