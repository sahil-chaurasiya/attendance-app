import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/admin', end: true, label: 'Dashboard',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  },
  {
    to: '/admin/employees', label: 'Employees',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    to: '/admin/attendance', label: 'Attendance',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    to: '/admin/reports', label: 'Reports',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    to: '/admin/wfh-requests', label: 'WFH',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/admin/leave-requests', label: 'Leaves',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    to: '/admin/regularization-requests', label: 'Regularize',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-dvh flex bg-surface">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-60 fixed h-full z-40"
        style={{
          background: '#0a0a0a',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 mb-1">
          <div
            className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: '0 0 0 1px rgba(245,197,24,0.15)' }}
          >
            <img src="/icon-192.png" alt="To Fly Media" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.1em] font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Nav section label */}
        <p className="text-[9px] text-gray-700 uppercase tracking-[0.15em] font-semibold px-5 mb-2">Navigation</p>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative
                 ${isActive
                   ? 'bg-brand-500/10 text-brand-400'
                   : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-brand-500"
                      style={{ boxShadow: '0 0 8px rgba(245,197,24,0.5)' }}
                    />
                  )}
                  <span className={isActive ? 'text-brand-500' : 'text-gray-600 group-hover:text-gray-300'}>{icon}</span>
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black bg-brand-500 flex-shrink-0"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-600">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-600 hover:text-red-400 py-2 px-3 rounded-xl hover:bg-red-500/[0.07] border border-transparent hover:border-red-500/20 transition-all duration-200 text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between"
        style={{
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
          paddingBottom: '12px',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(245,197,24,0.15)' }}>
            <img src="/icon-192.png" alt="To Fly Media" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-white text-sm tracking-tight">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/[0.07]"
        >
          Logout
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 safe-bottom z-50"
        style={{
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto px-1 py-2">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1.5 px-1.5 rounded-xl transition-all duration-200 relative
                 ${isActive ? 'text-brand-500' : 'text-gray-600 hover:text-gray-300'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-brand-500"
                      style={{ boxShadow: '0 0 8px rgba(245,197,24,0.6)' }}
                    />
                  )}
                  {icon}
                  <span className="text-[8px] font-medium tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-60 overflow-y-auto pt-[60px] md:pt-0 pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
