import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex" style={{ background: 'var(--cream)' }}>

      {/* ===== LEFT PANEL — hidden on mobile ===== */}
      <div
        className="hidden lg:flex flex-col justify-between w-[48%] p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'var(--grad-navy)' }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
              top: '-10%',
              left: '-10%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
              bottom: '-5%',
              right: '-5%',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />

          {/* Grid pattern */}
          <div className="absolute inset-0 grid-pattern" style={{ opacity: 0.4 }} />

          {/* Geometric decorations */}
          <div
            className="absolute top-20 right-20 w-32 h-32 rounded-3xl rotate-12"
            style={{
              border: '1px solid rgba(245,158,11,0.12)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-32 left-16 w-20 h-20 rounded-2xl -rotate-6"
            style={{
              border: '1px solid rgba(245,158,11,0.1)',
              animation: 'float 7s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute top-1/3 right-12 w-3 h-3 rounded-full"
            style={{
              background: 'var(--amber)',
              opacity: 0.3,
              animation: 'pulse-glow 3s infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full"
            style={{
              background: 'var(--amber)',
              opacity: 0.2,
              animation: 'pulse-glow 4s infinite 1s',
            }}
          />
        </div>

        {/* Brand */}
        <div className="relative z-10 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--grad-amber)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.6" />
                <path d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <div>
              <div className="font-display text-white font-bold text-xl">EduVN</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Learning Platform</div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display text-white text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Học hôm nay,
            <br />
            <span className="text-gradient">tỏa sáng</span>
            <br />
            ngày mai.
          </h2>
          <p className="mt-6 text-base leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Nền tảng học tập trực tuyến giúp học sinh Việt Nam
            chinh phục mọi bài kiểm tra và phát triển toàn diện.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Bài giảng online', 'Kiểm tra trắc nghiệm', 'Theo dõi tiến độ'].map((feat, i) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium fade-in"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  animationDelay: `${0.5 + i * 0.1}s`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)' }} />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          &copy; 2026 EduVN &middot; Nền tảng học tập thông minh
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)',
              top: '-20%',
              right: '-20%',
            }}
          />
        </div>

        <div className="w-full max-w-[400px] relative z-10">

          {/* Mobile brand */}
          <div className="lg:hidden mb-10 text-center fade-in">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--grad-amber)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="font-display font-bold text-2xl" style={{ color: 'var(--navy)' }}>EduVN</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Học tập thông minh</p>
          </div>

          {/* Heading */}
          <div className="mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Chào mừng trở lại
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Đăng nhập để tiếp tục hành trình học tập
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="toast toast-error mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 fade-in" style={{ animationDelay: '0.2s' }}>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="input pl-11"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-11 pr-11"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 014.09 5.12l2.523 2.523a4 4 0 004.135 6.288z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-[15px] mt-1"
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

          {/* Bottom info */}
          <div className="mt-8 text-center fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Liên hệ giáo viên nếu bạn quên mật khẩu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
