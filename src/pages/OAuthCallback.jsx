import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const ERROR_MESSAGES = {
  invalid_code: 'Mã mời không hợp lệ hoặc đã hết hạn.',
  code_used: 'Mã mời đã được sử dụng. Vui lòng liên hệ thầy/cô để lấy mã mới.',
  already_registered: 'Tài khoản Google này đã được đăng ký trước đó. Hãy đăng nhập thay vì đăng ký.',
  not_registered: 'Chưa có tài khoản nào liên kết với Google này. Bạn cần đăng ký bằng mã mời trước.',
  email_not_verified: 'Email Google chưa được xác thực.',
  account_suspended: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ thầy/cô.',
  oauth_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
};

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  const [state, setState] = useState({ phase: 'processing', message: '' });

  const status = searchParams.get('status');
  const errorCode = searchParams.get('error');

  useEffect(() => {
    if (status === 'error') {
      setState({
        phase: 'error',
        message: ERROR_MESSAGES[errorCode] || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
      return;
    }

    if (status !== 'success') {
      setState({ phase: 'error', message: 'Phản hồi không hợp lệ từ máy chủ.' });
      return;
    }

    let cancelled = false;
    refreshSession()
      .then(() => {
        if (!cancelled) {
          const role = searchParams.get('role');
          navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ phase: 'error', message: 'Không thể khởi tạo phiên đăng nhập. Vui lòng thử lại.' });
        }
      });

    return () => { cancelled = true; };
  }, [status, errorCode, refreshSession, navigate, searchParams]);

  if (state.phase === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
          <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang hoàn tất đăng nhập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--cream)' }}>
      <div className="max-w-md w-full bento-tile bento-tile-surface p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Không thể đăng nhập
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {state.message}
        </p>
        <div className="flex gap-2 justify-center">
          <Link to="/login" className="btn-primary px-5 py-2.5">Quay lại đăng nhập</Link>
          <Link to="/signup" className="btn-secondary px-5 py-2.5">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
