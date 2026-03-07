import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
const IconTuition = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
    <path d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
    <path d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconTrophy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 21h8M12 17v4M7 4H4a2 2 0 00-2 2v2a4 4 0 004 4h.5M17 4h3a2 2 0 012 2v2a4 4 0 01-4 4h-.5" />
    <path d="M7 4h10v6a5 5 0 01-10 0V4z" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const IconCards = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = localStorage.getItem('fullName') || 'Học viên';
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student/dashboard', label: 'Lớp của tôi', icon: <IconHome /> },
    { path: '/student/quizzes', label: 'Kiểm tra', icon: <IconQuiz /> },
    { path: '/student/flashcards', label: 'Flashcards', icon: <IconCards /> },
    { path: '/student/performance', label: 'Thống kê', icon: <IconChart /> },
    { path: '/student/achievements', label: 'Thành tích', icon: <IconTrophy /> },
    { path: '/student/tuition', label: 'Học phí', icon: <IconTuition /> },
    { path: '/student/profile', label: 'Tài khoản', icon: <IconUser /> },
  ];

  // Bottom nav shows first 5 items; the rest go into mobile menu
  const bottomNavItems = menuItems.slice(0, 5);
  const moreMenuItems = menuItems.slice(5);

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ===== DESKTOP HEADER — two-tier ===== */}
      <header className="hidden md:block sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Top row: brand + user controls */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            {/* Brand */}
            <Link to="/student/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--grad-amber)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="font-display font-bold text-base" style={{ color: 'var(--navy)' }}>EduVN</span>
            </Link>

            {/* User controls */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>

              <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

              {/* Avatar + name */}
              <Link
                to="/student/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--amber-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {fullName.split(' ').pop()}
                  </div>
                  <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>Học viên</div>
                </div>
              </Link>

              <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                title="Đăng xuất"
              >
                <IconLogout />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: nav tabs */}
        <div className="max-w-6xl mx-auto px-6" style={{ borderTop: '1px solid var(--border-light)' }}>
          <nav className="flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative shrink-0"
                  style={{
                    color: isActive ? 'var(--amber-warm)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '2px solid var(--amber-warm)' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand */}
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-amber)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display font-bold text-base" style={{ color: 'var(--navy)' }}>EduVN</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
            >
              {fullName.charAt(0).toUpperCase()}
            </div>
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)', background: mobileMenuOpen ? 'var(--amber-soft)' : 'transparent' }}
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down drawer */}
        {mobileMenuOpen && (
          <div className="border-t" style={{ borderColor: 'var(--border-light)', background: 'var(--white)' }}>
            <nav className="px-3 py-2 space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'var(--amber-warm)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--amber-soft)' : 'transparent',
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-1 mt-1" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all"
                  style={{ color: '#ef4444' }}
                >
                  <IconLogout />
                  Đăng xuất
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV (first 5 items) ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all flex-1"
                style={{ color: isActive ? 'var(--amber-warm)' : 'var(--text-muted)' }}
              >
                <span
                  className="flex items-center justify-center w-10 h-7 rounded-lg transition-colors"
                  style={{ background: isActive ? 'var(--amber-soft)' : 'transparent' }}
                >
                  {item.icon}
                </span>
                <span className="text-[9px] font-semibold leading-tight text-center">{item.label}</span>
              </Link>
            );
          })}

          {/* "More" button opens drawer for remaining items */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all flex-1"
            style={{ color: mobileMenuOpen ? 'var(--amber-warm)' : 'var(--text-muted)' }}
          >
            <span
              className="flex items-center justify-center w-10 h-7 rounded-lg transition-colors"
              style={{ background: mobileMenuOpen ? 'var(--amber-soft)' : 'transparent' }}
            >
              <IconMenu />
            </span>
            <span className="text-[9px] font-semibold">Thêm</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default StudentLayout;
