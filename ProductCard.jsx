import { format, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  MdDevices, MdCalendarToday, MdVerified, MdWarning, MdError, MdQrCode2, MdBuild
} from 'react-icons/md';

const categoryIcons = {
  Smartphone: '📱',
  Laptop: '💻',
  Tablet: '📟',
  Desktop: '🖥️',
  TV: '📺',
  Appliance: '🏠',
  Camera: '📷',
  Audio: '🎧',
  Gaming: '🎮',
  Wearable: '⌚',
  Other: '📦',
};

const warrantyBadge = {
  active: { label: 'Under Warranty', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: MdVerified },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: MdWarning },
  expired: { label: 'Warranty Expired', color: 'bg-red-100 text-red-700 border-red-200', icon: MdError },
};

export default function ProductCard({ product }) {
  const badge = warrantyBadge[product.warrantyStatus] || warrantyBadge.expired;
  const BadgeIcon = badge.icon;
  const emoji = categoryIcons[product.category] || '📦';

  const formatDate = (d) => {
    const date = new Date(d);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 card-hover overflow-hidden fade-in-up">
      {/* Header strip */}
      <div className="h-1.5 bg-gradient-to-r from-navy-700 to-teal-500" style={{ background: 'linear-gradient(to right, #1530ab, #0d9488)' }} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
              {emoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-base truncate leading-tight">{product.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{product.brand} · {product.model}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${badge.color}`}>
            <BadgeIcon className="text-xs" />
            {badge.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MdQrCode2 className="text-slate-400 flex-shrink-0" />
            <span className="font-mono text-xs bg-slate-50 px-2 py-0.5 rounded">{product.serialNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MdCalendarToday className="text-slate-400 flex-shrink-0" />
            <span className="text-xs">Purchased: {formatDate(product.purchaseDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MdDevices className="text-slate-400 flex-shrink-0" />
            <span className="text-xs">Warranty until: {formatDate(product.warrantyExpiry)}</span>
          </div>
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
            {product.category}
          </span>
          {product.warrantyStatus === 'active' && (
            <span className="text-xs text-slate-400">
              {product.warrantyDaysRemaining} days left
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 text-center px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            View Passport
          </Link>
          <Link
            to={`/products/${product._id}/add-repair`}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <MdBuild className="text-sm" />
            Repair
          </Link>
        </div>
      </div>
    </div>
  );
}
