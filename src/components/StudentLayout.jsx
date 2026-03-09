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
const IconCards = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const IconDocument = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
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
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconAIChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const StudentLayout = ({ children, fullHeight = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = localStorage.getItem('fullName') || 'Học viên';
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student/dashboard',    label: 'Lớp của tôi', icon: <IconHome /> },
    { path: '/student/quizzes',      label: 'Kiểm tra',    icon: <IconQuiz /> },
    { path: '/student/flashcards',   label: 'Flashcards',  icon: <IconCards /> },
    { path: '/student/documents',    label: 'Tài liệu',    icon: <IconDocument /> },
    { path: '/student/chat',         label: 'EduBot AI',   icon: <IconAIChat />, highlight: true },
    { path: '/student/performance',  label: 'Thống kê',    icon: <IconChart /> },
    { path: '/student/achievements', label: 'Thành tích',  icon: <IconTrophy /> },
    { path: '/student/tuition',      label: 'Học phí',     icon: <IconTuition /> },
    { path: '/student/profile',      label: 'Tài khoản',   icon: <IconUser /> },
  ];

  // ── Sidebar content shared between desktop fixed + mobile drawer ──
  const SidebarContent = ({ onNav }) => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <Link
        to="/student/dashboard"
        onClick={onNav}
        className="flex items-center gap-3 px-5 py-5 shrink-0"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--grad-amber)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
            <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
        <span className="font-display font-bold text-lg text-white tracking-tight">EduVN</span>
      </Link>

      {/* User card */}
      <div className="mx-3 mb-4 px-3 py-3 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--grad-amber)', color: 'white' }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-white">{fullName}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Học viên</div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 mb-2">
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Menu
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNav}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(234,88,12,0.18))'
                  : 'transparent',
                borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
            >
              <span style={{ color: isActive ? 'var(--amber-glow)' : 'inherit' }}>{item.icon}</span>
              {item.label}
              {item.highlight && !isActive && (
                <span
                  className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={{ background: 'var(--amber)', color: '#fff' }}
                >
                  AI
                </span>
              )}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--amber)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 pb-4 pt-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          <IconLogout />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cream)' }}>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 w-56"
        style={{ background: 'var(--navy)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
      >
        <SidebarContent onNav={() => {}} />
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--navy)', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}
      >
        <Link to="/student/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-amber)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
              <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display font-bold text-base text-white">EduVN</span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'var(--grad-amber)', color: 'white' }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <IconMenu />
          </button>
        </div>
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="md:hidden fixed top-0 left-0 h-screen z-50 w-64 slide-in-left"
            style={{ background: 'var(--navy)' }}
          >
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      {fullHeight ? (
        /* Full-height mode (chat page):
           position:fixed + inset-0 anchors all four edges to the visual viewport,
           completely bypassing parent height / viewport-unit browser inconsistencies.
           md:left-56 shifts the left edge past the desktop sidebar (w-56 = 224px).
           z-10 keeps it below the mobile header (z-30) and mobile drawer (z-40/50). */
        <main className="fixed inset-0 md:left-56 z-10 flex flex-col overflow-hidden"
          style={{ background: 'var(--bg-primary)' }}
        >
          {/* pt-14 creates space for the fixed mobile header (h-14 = 56px).
              md:pt-0 removes it on desktop where there is no top bar. */}
          <div className="pt-14 md:pt-0 flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </main>
      ) : (
        /* Normal mode: padded content container */
        <main className="flex-1 md:ml-56 min-h-screen pt-14 md:pt-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 pb-8 fade-in">
            {children}
          </div>
        </main>
      )}
    </div>
  );
};

export default StudentLayout;
