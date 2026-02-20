import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const IconPhoto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
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
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconQuiz = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const menuItems = [
  { path: '/admin/dashboard', label: 'Tổng quan', icon: <IconGrid /> },
  { path: '/admin/students', label: 'Học viên', icon: <IconUsers /> },
  { path: '/admin/classes', label: 'Lớp học', icon: <IconBook /> },
  { path: '/admin/upload', label: 'Tài nguyên', icon: <IconPhoto /> },
  { path: '/admin/questions', label: 'Ngân hàng CH', icon: <IconDatabase /> },
  { path: '/admin/quizzes', label: 'Quiz', icon: <IconQuiz /> },
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
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--cream)' }}>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden modal-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`sidebar-transition fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--navy)', minHeight: '100vh' }}
      >
        {/* Sidebar gradient accent */}
        <div className="absolute top-0 right-0 w-px h-full" style={{ background: 'linear-gradient(to bottom, rgba(245,158,11,0.2), transparent 30%, transparent 70%, rgba(245,158,11,0.1))' }} />

        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--grad-amber)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white">
                <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div className="font-display text-white font-bold text-base leading-tight">EduVN</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Quản trị hệ thống</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <IconX />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Menu
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium ${
                  isActive ? 'sidebar-active' : ''
                }`}
                style={{
                  color: isActive ? 'var(--amber-glow)' : 'rgba(255,255,255,0.55)',
                  paddingLeft: isActive ? '9px' : '12px',
                }}
              >
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                  style={{
                    background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? 'var(--amber-glow)' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-item flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <IconLogout />
            </span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="md:hidden flex-shrink-0 flex items-center gap-3 px-4 h-14 glass-dark"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <IconMenu />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-amber)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display text-white font-bold text-sm">EduVN Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
