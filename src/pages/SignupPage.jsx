import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/useAuth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GoogleGlyph = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden="true">
    <path d="M19.6 10.23c0-.69-.06-1.35-.18-1.98H10v3.75h5.38a4.6 4.6 0 01-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.3z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.96-.9 6.61-2.44l-3.23-2.51c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.59A9.99 9.99 0 0010 20z" fill="#34A853"/>
    <path d="M4.42 11.88A6 6 0 014.1 10c0-.65.11-1.29.32-1.88V5.53H1.08a10 10 0 000 8.94l3.34-2.59z" fill="#FBBC05"/>
    <path d="M10 3.98c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.93 9.93 0 0010 0a10 10 0 00-8.92 5.53l3.34 2.59C5.2 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = (searchParams.get('code') || '').trim().toUpperCase();
  const { refreshSession } = useAuth();

  const [code, setCode] = useState(codeFromUrl);
  const [codeState, setCodeState] = useState({ status: 'idle', data: null, error: '' });
  const [tab, setTab] = useState('password');
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', fullName: '', phone: '', parentName: '', parentPhone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!code) {
      setCodeState({ status: 'idle', data: null, error: '' });
      return;
    }
    let cancelled = false;
    setCodeState({ status: 'checking', data: null, error: '' });
    axiosClient
      .get(`/auth/invite-codes/${encodeURIComponent(code)}/check`, { _skipRefresh: true })
      .then((res) => {
        if (!cancelled) {
          setCodeState({ status: 'valid', data: res.data, error: '' });
          setForm((prev) => ({ ...prev, fullName: prev.fullName || res.data.prefill?.name || '' }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err.response?.data?.message || 'Mã mời không hợp lệ';
          setCodeState({ status: 'invalid', data: null, error: message });
        }
      });
    return () => { cancelled = true; };
  }, [code]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    setCode(trimmed);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (form.password.length < 8) {
      setSubmitError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setSubmitError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.username.length < 3) {
      setSubmitError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code,
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        parentInfo: (form.parentName || form.parentPhone)
          ? { name: form.parentName.trim(), phone: form.parentPhone.trim() }
          : undefined,
      };
      await axiosClient.post('/auth/signup', payload, { _skipRefresh: true });
      await refreshSession();
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE}/auth/google/signup?code=${encodeURIComponent(code)}`;
  };

  const updateForm = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-lg">
        <div className="mb-6 fade-in text-center">
          <div className="bento-label mb-2" style={{ color: 'var(--amber-warm)' }}>Đăng ký</div>
          <h1 className="bento-hero-title" style={{ color: 'var(--text-primary)' }}>
            Bắt đầu hành trình học tập
          </h1>
          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            Nhập mã mời bạn nhận được từ thầy/cô để tạo tài khoản
          </p>
        </div>

        {/* Code input / validation */}
        {codeState.status !== 'valid' && (
          <form onSubmit={handleCodeSubmit} className="bento-tile bento-tile-surface p-6 mb-4 fade-in-up">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Mã mời
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1 tracking-widest font-mono text-center uppercase"
                placeholder="XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={16}
                autoFocus
              />
              <button type="submit" className="btn-primary px-5" disabled={!code || codeState.status === 'checking'}>
                {codeState.status === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra'}
              </button>
            </div>
            {codeState.status === 'invalid' && (
              <div className="toast toast-error mt-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {codeState.error}
              </div>
            )}
          </form>
        )}

        {/* Signup form */}
        {codeState.status === 'valid' && (
          <div className="bento-tile bento-tile-surface p-6 fade-in-up">
            {codeState.data?.class && (
              <div className="mb-5 p-3 rounded-xl" style={{ background: 'var(--olive-soft)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--olive)' }}>✓ Mã hợp lệ</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                  Đăng ký vào lớp: <span className="font-bold">{codeState.data.class.name}</span>
                  {codeState.data.class.grade && <span> · Khối {codeState.data.class.grade}</span>}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'var(--cream-warm)' }}>
              <button
                type="button"
                onClick={() => setTab('password')}
                className={`tab-pill flex-1 ${tab === 'password' ? 'active' : ''}`}
                style={tab !== 'password' ? { color: 'var(--text-secondary)' } : {}}
              >
                Tên đăng nhập + mật khẩu
              </button>
              <button
                type="button"
                onClick={() => setTab('google')}
                className={`tab-pill flex-1 ${tab === 'google' ? 'active' : ''}`}
                style={tab !== 'google' ? { color: 'var(--text-secondary)' } : {}}
              >
                Google
              </button>
            </div>

            {submitError && (
              <div className="toast toast-error mb-4">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {submitError}
              </div>
            )}

            {tab === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Họ và tên
                  </label>
                  <input type="text" className="input" value={form.fullName} onChange={updateForm('fullName')} required placeholder="Nguyễn Văn A" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Tên đăng nhập
                    </label>
                    <input type="text" className="input" value={form.username} onChange={updateForm('username')} required minLength={3} placeholder="vd: nguyenvana" autoComplete="username" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Số điện thoại
                    </label>
                    <input type="tel" className="input" value={form.phone} onChange={updateForm('phone')} placeholder="0912345678" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Mật khẩu
                    </label>
                    <input type="password" className="input" value={form.password} onChange={updateForm('password')} required minLength={8} autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Nhập lại mật khẩu
                    </label>
                    <input type="password" className="input" value={form.confirmPassword} onChange={updateForm('confirmPassword')} required autoComplete="new-password" />
                  </div>
                </div>

                <details className="pt-2">
                  <summary className="text-xs cursor-pointer font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Thông tin phụ huynh (tùy chọn)
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <input type="text" className="input" value={form.parentName} onChange={updateForm('parentName')} placeholder="Tên phụ huynh" />
                    <input type="tel" className="input" value={form.parentPhone} onChange={updateForm('parentPhone')} placeholder="SĐT phụ huynh" />
                  </div>
                </details>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3 mt-2">
                  {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Dùng tài khoản Google của bạn để đăng ký. Chúng tôi chỉ sử dụng email và tên để tạo hồ sơ học viên.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="btn-secondary w-full py-3 flex items-center justify-center gap-3"
                  style={{ background: 'var(--white)', border: '1px solid var(--border)' }}
                >
                  <GoogleGlyph />
                  <span className="font-semibold">Đăng ký với Google</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center fade-in">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--amber-warm)' }}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
