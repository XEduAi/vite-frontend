import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('fullName', data.fullName || '');
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f5f0' }}>

      {/* ===== LEFT PANEL — hidden on mobile ===== */}
      <div
        className="hidden md:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: '#14213d' }}
      >
        {/* Geometric decoration */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          {/* Large circle */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-2" style={{ borderColor: '#e8850a' }} />
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full border" style={{ borderColor: '#e8850a' }} />
          {/* Bottom shapes */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-2" style={{ borderColor: '#e8850a' }} />
          {/* Grid dots */}
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <div
                key={`${row}-${col}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: '#e8850a',
                  top: `${row * 14 + 5}%`,
                  left: `${col * 18 + 4}%`,
                  opacity: 0.6,
                }}
              />
            ))
          )}
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="font-display text-white font-semibold text-3xl">LMS</div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Learning Management System</div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="font-display text-white text-4xl font-light leading-snug">
            Tri thức là<br />
            <span style={{ color: '#e8850a' }}>hành trang</span><br />
            mãi mãi.
          </h2>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Nền tảng quản lý học tập dành cho giáo viên<br />và học sinh.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © 2026 LMS
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="md:hidden mb-8 text-center">
            <div className="font-display font-semibold text-3xl" style={{ color: '#14213d' }}>LMS</div>
            <div className="text-sm mt-1" style={{ color: '#78716c' }}>Hệ thống quản lý học tập</div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold" style={{ color: '#1c1917' }}>
              Chào mừng trở lại
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#78716c' }}>
              Đăng nhập để tiếp tục
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm border"
              style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#44403c' }}>
                Tên đăng nhập
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all"
                style={{ borderColor: '#e5ddd0', background: '#ffffff', color: '#1c1917' }}
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#44403c' }}>
                Mật khẩu
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all"
                style={{ borderColor: '#e5ddd0', background: '#ffffff', color: '#1c1917' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2 disabled:opacity-70"
              style={{ background: loading ? '#c8730a' : '#e8850a' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4740a'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#e8850a'; }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
