import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdDevices,
  MdAddBox,
  MdQrCode2,
  MdBuild,
} from 'react-icons/md';

const navItems = [
  { to: '/', icon: MdDashboard, label: 'Dashboard' },
  { to: '/products', icon: MdDevices, label: 'Products' },
  { to: '/register', icon: MdAddBox, label: 'Register Product' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-navy flex items-center justify-center shadow-lg">
            <MdQrCode2 className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-none font-outfit">Smart Product</h1>
            <p className="text-teal-400 text-xs font-medium tracking-wide">Passport</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive(to)
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Icon className={`text-xl flex-shrink-0 ${isActive(to) ? 'text-teal-400' : 'group-hover:text-teal-400'} transition-colors`} />
            <span className="text-sm font-medium">{label}</span>
            {isActive(to) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />
            )}
          </Link>
        ))}

        <div className="mt-6">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Tools</p>
          <Link
            to="/products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all duration-200 group"
          >
            <MdBuild className="text-xl flex-shrink-0 group-hover:text-teal-400 transition-colors" />
            <span className="text-sm font-medium">Repair Records</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div>
            <p className="text-white text-xs font-medium">Admin User</p>
            <p className="text-slate-500 text-xs">admin@passport.dev</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
