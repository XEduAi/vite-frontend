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

const IconQuiz = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
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
    { path: '/student/quizzes', label: 'Kiểm tra', icon: <IconQuiz /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ===== DESKTOP HEADER ===== */}
      <header className="hidden md:block sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-amber)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--navy)' }}>
                EduVN
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'var(--amber-warm)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--amber-soft)' : 'transparent',
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
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fullName}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Học viên</div>
                </div>
              </div>
              <div className="w-px h-8" style={{ background: 'var(--border)' }} />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-2 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-amber)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display font-bold text-base" style={{ color: 'var(--navy)' }}>EduVN</span>
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
            >
              {fullName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{fullName.split(' ').pop()}</span>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-around h-16 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
                style={{ color: isActive ? 'var(--amber-warm)' : 'var(--text-muted)' }}
              >
                <span
                  className="flex items-center justify-center w-10 h-7 rounded-lg transition-colors"
                  style={{ background: isActive ? 'var(--amber-soft)' : 'transparent' }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center justify-center w-10 h-7 rounded-lg">
              <IconLogout />
            </span>
            <span className="text-[10px] font-semibold">Thoát</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default StudentLayout;
