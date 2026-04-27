import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, LogOut, Shield, CalendarDays, Grid2x2, Store, Utensils, Home, User, X, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin, isSuperAdmin, isHost } = useAuth();
  const { event } = useEvent();
  const navigate = useNavigate();

  const slug = event?.slug;
  const homeLink = slug ? `/e/${slug}` : '/';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="bg-header sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-white p-1 flex flex-col gap-[5px] w-8 h-8 items-center justify-center"
            aria-label="Open menu"
          >
            <span className="block h-0.5 w-5 bg-white rounded-full" />
            <span className="block h-0.5 w-5 bg-white rounded-full" />
            <span className="block h-0.5 w-3.5 bg-white rounded-full self-start ml-0.5" />
          </button>

          <Link to={homeLink} className="flex items-center justify-center">
            <img src="/logo.png" alt="Littlelist" className="h-9 w-auto" />
          </Link>

          {slug ? (
            <Link to={`/e/${slug}/reserved`} className="text-white p-1">
              <ShoppingBag size={24} />
            </Link>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="bg-header px-5 pt-10 pb-6 relative">
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          <div className="flex items-center mb-1">
            <img src="/logo.png" alt="Littlelist" className="h-8 w-auto" />
          </div>
          {user ? (
            <p className="text-white/70 text-sm mt-3 font-medium">
              {user.firstName} {user.lastName}
            </p>
          ) : (
            <p className="text-white/60 text-sm mt-3">Welcome!</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <NavItem to={homeLink} icon={<Home size={17} />} label="Home" onClick={close} />

          {slug && (
            <>
              <SectionLabel>Browse</SectionLabel>
              <NavItem to={`/e/${slug}/categories`} icon={<Grid2x2 size={17} />} label="Categories" onClick={close} />
              <NavItem to={`/e/${slug}/stores`} icon={<Store size={17} />} label="Stores" onClick={close} />
              <NavItem to={`/e/${slug}/nappy-list`} icon={<Utensils size={17} />} label="Nappy List" onClick={close} />
              <NavItem to={`/e/${slug}/reserved`} icon={<ShoppingBag size={17} />} label="My Reserved Items" onClick={close} />
            </>
          )}

          {isHost && (
            <>
              <SectionLabel>Host</SectionLabel>
              <NavItem to="/host/dashboard" icon={<CalendarDays size={17} />} label="My Event Dashboard" onClick={close} accent />
            </>
          )}

          {isSuperAdmin && (
            <>
              <SectionLabel>Super Admin</SectionLabel>
              <NavItem to="/superadmin" icon={<ListChecks size={17} />} label="Product Templates" onClick={close} accent />
              <NavItem to="/admin" icon={<Shield size={17} />} label="Admin Dashboard" onClick={close} accent />
            </>
          )}

          {isAdmin && !isSuperAdmin && (
            <>
              <SectionLabel>Admin</SectionLabel>
              <NavItem to="/admin" icon={<Shield size={17} />} label="Admin Dashboard" onClick={close} accent />
            </>
          )}

          {!user && slug && (
            <>
              <SectionLabel>Account</SectionLabel>
              <NavItem to={`/e/${slug}/register`} icon={<User size={17} />} label="Register as Guest" onClick={close} />
            </>
          )}
        </nav>

        {/* Footer */}
        {user && (
          <div className="px-3 py-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-medium"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function NavItem({ to, icon, label, onClick, accent }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
        ${accent ? 'text-header hover:bg-header/10' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      <span className={`flex-shrink-0 ${accent ? 'text-header' : 'text-gray-400'}`}>{icon}</span>
      {label}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 pt-4 pb-1">
      {children}
    </p>
  );
}
