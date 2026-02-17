import { Link, useLocation, useNavigate } from 'react-router-dom';

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = localStorage.getItem('fullName') || 'Học viên';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student/dashboard', label: 'Lớp của tôi', icon: <IconHome /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f8f5f0' }}>

      {/* ===== DESKTOP HEADER ===== */}
      <header
        className="hidden md:block sticky top-0 z-30 border-b"
        style={{ background: '#ffffff', borderColor: '#e5ddd0', boxShadow: '0 1px 0 rgba(160,100,20,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/student/dashboard" className="flex items-center gap-2">
              <span
                className="font-display font-semibold text-xl"
                style={{ color: '#14213d' }}
              >
                LMS
              </span>
              <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                Học viên
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: isActive ? '#e8850a' : '#78716c',
                      background: isActive ? 'rgba(232,133,10,0.08)' : 'transparent',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User + Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs" style={{ color: '#a8a29e' }}>Xin chào,</div>
                <div className="text-sm font-semibold" style={{ color: '#1c1917' }}>{fullName}</div>
              </div>
              <div className="w-px h-8" style={{ background: '#e5ddd0' }} />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: '#a8a29e' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a8a29e'}
              >
                <IconLogout />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE HEADER ===== */}
      <header
        className="md:hidden sticky top-0 z-30 border-b"
        style={{ background: '#ffffff', borderColor: '#e5ddd0' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/student/dashboard">
            <span className="font-display font-semibold text-lg" style={{ color: '#14213d' }}>LMS</span>
          </Link>
          <div className="text-sm font-medium" style={{ color: '#78716c' }}>{fullName}</div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
        style={{ background: '#ffffff', borderColor: '#e5ddd0', boxShadow: '0 -2px 12px rgba(160,100,20,0.08)' }}
      >
        <div className="flex items-center justify-around h-16 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
                style={{ color: isActive ? '#e8850a' : '#a8a29e' }}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            style={{ color: '#a8a29e' }}
          >
            <IconLogout />
            <span className="text-xs font-medium">Đăng xuất</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default StudentLayout;
