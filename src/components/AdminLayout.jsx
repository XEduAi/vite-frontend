import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const IconPhoto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const menuItems = [
  { path: '/admin/dashboard', label: 'Tổng quan', icon: <IconGrid /> },
  { path: '/admin/students', label: 'Học viên', icon: <IconUsers /> },
  { path: '/admin/classes', label: 'Lớp học', icon: <IconBook /> },
  { path: '/admin/upload', label: 'Tài nguyên', icon: <IconPhoto /> },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f5f0' }}>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`sidebar-transition fixed inset-y-0 left-0 z-50 flex flex-col w-60 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#14213d', minHeight: '100vh' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <div className="font-display text-white font-semibold text-lg leading-tight">LMS</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Quản trị hệ thống</div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <IconX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'sidebar-active'
                    : 'hover:bg-white/8'
                }`}
                style={{
                  color: isActive ? '#f0a832' : 'rgba(255,255,255,0.65)',
                  paddingLeft: isActive ? '9px' : '12px',
                }}
              >
                <span style={{ color: isActive ? '#f0a832' : 'rgba(255,255,255,0.5)' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.background = 'rgba(220,38,38,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <IconLogout />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="md:hidden flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b"
          style={{ background: '#14213d', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <IconMenu />
          </button>
          <span className="font-display text-white font-semibold">LMS Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
