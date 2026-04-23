import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--cream)' }}>
        <div className="card max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Đã xảy ra lỗi
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Giao diện gặp sự cố không mong muốn. Vui lòng tải lại trang để tiếp tục.
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ background: 'var(--amber)', color: 'white' }}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
