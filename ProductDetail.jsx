import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getRepairs, verifyAuditChain } from '../api';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { format, isValid } from 'date-fns';
import {
  MdArrowBack, MdQrCode2, MdBuild, MdVerified, MdWarning, MdError,
  MdPrint, MdOpenInNew, MdShield, MdCheckCircle, MdCancel, MdInfo,
  MdCalendarToday, MdPerson, MdAttachMoney,
} from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';

const statusColors = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};
const statusLabels = {
  completed: 'Completed', in_progress: 'In Progress', pending: 'Pending', cancelled: 'Cancelled',
};

const warrantyConfig = {
  active: { label: 'Under Warranty', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: MdVerified },
  expiring_soon: { label: 'Expiring Soon', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: MdWarning },
  expired: { label: 'Warranty Expired', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: MdError },
};

const categoryIcons = {
  Smartphone: '📱', Laptop: '💻', Tablet: '📟', Desktop: '🖥️',
  TV: '📺', Appliance: '🏠', Camera: '📷', Audio: '🎧',
  Gaming: '🎮', Wearable: '⌚', Other: '📦',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productRes, repairsRes] = await Promise.all([
        getProduct(id),
        getRepairs(id),
      ]);
      setProduct(productRes.data.data);
      setRepairs(repairsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleVerifyAudit = async () => {
    try {
      setVerifying(true);
      setAuditResult(null);
      const res = await verifyAuditChain(id);
      setAuditResult(res.data.data);
    } catch (err) {
      setAuditResult({ error: err.response?.data?.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const fmt = (d) => {
    const date = new Date(d);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
  };

  if (loading) return <div className="p-8"><PageLoader /></div>;
  if (error) return <div className="p-8"><ErrorMessage message={error} onRetry={fetchData} /></div>;
  if (!product) return null;

  const wConfig = warrantyConfig[product.warrantyStatus] || warrantyConfig.expired;
  const WIcon = wConfig.icon;
  const passportUrl = product.passportUrl || `${window.location.origin}/passport/${product._id}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 fade-in-up">
        <Link
          to="/products"
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <MdArrowBack className="text-slate-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{categoryIcons[product.category] || '📦'}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-outfit">{product.name}</h1>
              <p className="text-slate-500 text-sm">{product.brand} · {product.model}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors no-print"
          >
            <MdPrint /> Print
          </button>
          <Link
            to={`/passport/${product._id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 no-print"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            <MdOpenInNew /> Public Passport
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="xl:col-span-2 space-y-5">
          {/* Product info card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 fade-in-up print-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 font-outfit">Product Details</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${wConfig.bg} ${wConfig.color} ${wConfig.border}`}>
                <WIcon />
                {wConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Serial Number', value: <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{product.serialNumber}</span> },
                { label: 'Category', value: product.category },
                { label: 'Purchase Date', value: fmt(product.purchaseDate) },
                { label: 'Warranty Expiry', value: fmt(product.warrantyExpiry) },
                { label: 'Registered', value: fmt(product.createdAt) },
                { label: 'Days Remaining', value: product.warrantyStatus === 'expired' ? 'Expired' : `${product.warrantyDaysRemaining} days` },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-slate-700 font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>

            {product.description && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Repair Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 fade-in-up print-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-outfit">Repair History</h2>
                <p className="text-slate-400 text-xs mt-0.5">{repairs.length} record{repairs.length !== 1 ? 's' : ''}</p>
              </div>
              <Link
                to={`/products/${id}/add-repair`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 no-print"
                style={{ background: 'linear-gradient(135deg, #1530ab, #2a5cff)' }}
              >
                <MdBuild className="text-sm" /> Add Repair
              </Link>
            </div>

            {repairs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔧</div>
                <p className="text-slate-500 font-medium">No repair records</p>
                <p className="text-slate-400 text-sm mt-1">This product has no service history yet.</p>
              </div>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-teal-400 to-slate-200" />
                {repairs.map((repair, idx) => (
                  <div key={repair._id} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      repair.serviceStatus === 'completed' ? 'bg-emerald-50 border-emerald-400' :
                      repair.serviceStatus === 'in_progress' ? 'bg-blue-50 border-blue-400' :
                      'bg-amber-50 border-amber-400'
                    }`}>
                      <MdBuild className={`text-sm ${
                        repair.serviceStatus === 'completed' ? 'text-emerald-600' :
                        repair.serviceStatus === 'in_progress' ? 'text-blue-600' : 'text-amber-600'
                      }`} />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{repair.problemDescription}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MdCalendarToday />{fmt(repair.repairDate)}</span>
                            <span className="flex items-center gap-1"><MdPerson />{repair.technicianName}</span>
                            <span className="flex items-center gap-1"><MdAttachMoney />${repair.repairCost.toFixed(2)}</span>
                          </div>
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${statusColors[repair.serviceStatus] || ''}`}>
                          {statusLabels[repair.serviceStatus] || repair.serviceStatus}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium text-slate-700">Action: </span>{repair.repairAction}
                      </div>
                      {repair.replacedParts?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {repair.replacedParts.map((part, i) => (
                            <span key={i} className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                              {part}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-400 font-mono truncate">
                          <span className="font-semibold not-italic text-slate-500">Hash #{repair.sequenceNumber}:</span> {repair.recordHash}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Verification */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 fade-in-up no-print">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <MdShield className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-outfit">Tamper-Evident Audit</h2>
                <p className="text-slate-400 text-xs">SHA-256 hash chain verification</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
              <MdInfo className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Hash verification confirms that stored records have not been silently altered after they were written.
                It does <strong>not</strong> independently prove that the described repairs occurred in the physical world.
              </p>
            </div>

            <button
              onClick={handleVerifyAudit}
              disabled={verifying || repairs.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
            >
              {verifying ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying...</>
              ) : (
                <><MdShield /> Verify Audit Chain</>
              )}
            </button>

            {auditResult && !auditResult.error && (
              <div className={`mt-4 p-4 rounded-xl border ${auditResult.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {auditResult.valid
                    ? <MdCheckCircle className="text-emerald-600 text-xl" />
                    : <MdCancel className="text-red-600 text-xl" />
                  }
                  <p className={`font-bold text-sm ${auditResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                    {auditResult.valid ? 'Chain Integrity Verified' : `Integrity Issue Detected at Record #${auditResult.tamperedAt + 1}`}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mb-3">{auditResult.disclaimer}</p>
                <div className="space-y-1">
                  {auditResult.details?.map((d) => (
                    <div key={d.sequenceNumber} className={`flex items-center justify-between text-xs p-2 rounded-lg ${d.ok ? 'bg-white' : 'bg-red-100'}`}>
                      <span className="text-slate-600">Record #{d.sequenceNumber} – {d.technicianName}</span>
                      <span className={`font-semibold ${d.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                        {d.ok ? '✓ Valid' : '✕ TAMPERED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {auditResult?.error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {auditResult.error}
              </div>
            )}

            {repairs.length === 0 && (
              <p className="mt-3 text-sm text-slate-400">No repair records to verify.</p>
            )}
          </div>
        </div>

        {/* Right col: QR Code + Passport */}
        <div className="space-y-5">
          {/* QR Code card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center fade-in-up print-card">
            <div className="flex items-center gap-2 mb-5 justify-center">
              <MdQrCode2 className="text-2xl text-slate-700" />
              <h2 className="text-lg font-bold text-slate-800 font-outfit">Digital Passport QR</h2>
            </div>
            <div className="inline-block p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-4">
              <QRCodeSVG
                value={passportUrl}
                size={180}
                fgColor="#0f172a"
                bgColor="#ffffff"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-slate-400 mb-3">Scan to open product passport</p>
            <a
              href={passportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-600 text-xs hover:underline"
            >
              <MdOpenInNew className="text-sm" /> Open Passport Page
            </a>
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 fade-in-up">
            <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Total Repairs</span>
                <span className="font-bold text-slate-800">{repairs.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Total Cost</span>
                <span className="font-bold text-slate-800">${repairs.reduce((s, r) => s + r.repairCost, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">In Progress</span>
                <span className="font-bold text-slate-800">{repairs.filter((r) => r.serviceStatus === 'in_progress').length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm">Warranty Status</span>
                <span className={`text-sm font-semibold ${wConfig.color}`}>{wConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 fade-in-up no-print">
            <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to={`/products/${id}/add-repair`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MdBuild className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Add Repair Record</span>
              </Link>
              <Link
                to={`/passport/${product._id}`}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <MdOpenInNew className="text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">View Public Passport</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group w-full text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MdPrint className="text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Print Passport</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
