import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const CATEGORY_MAP = {
  đề_thi: 'Đề thi',
  tài_liệu: 'Tài liệu',
  bài_giảng: 'Bài giảng',
  sách: 'Sách',
  khác: 'Khác',
};

const CATEGORY_BADGE = {
  đề_thi: 'badge-red',
  tài_liệu: 'badge-blue',
  bài_giảng: 'badge-purple',
  sách: 'badge-green',
  khác: 'badge-gray',
};

const CATEGORY_GRADIENT = {
  đề_thi: 'linear-gradient(135deg, #ef4444, #dc2626)',
  tài_liệu: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  bài_giảng: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  sách: 'linear-gradient(135deg, #10b981, #059669)',
  khác: 'linear-gradient(135deg, #64748b, #475569)',
};

const CATEGORY_ICON = {
  đề_thi: '📝',
  tài_liệu: '📄',
  bài_giảng: '🎓',
  sách: '📚',
  khác: '📎',
};

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/student/my-documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const handleDownload = async (docId) => {
    try {
      setDownloadingId(docId);
      const res = await axiosClient.get(`/student/my-documents/${docId}/download`);
      const urls = res.data.downloadUrls || res.data.files || [];

      if (Array.isArray(urls) && urls.length > 0) {
        urls.forEach((file) => {
          const url = typeof file === 'string' ? file : file.url;
          if (url) {
            window.open(url, '_blank');
          }
        });
      } else if (res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        showMsg('Không tìm thấy tệp tải về', 'error');
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi khi tải tài liệu', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải tài liệu...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Tài liệu của tôi
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Quản lý và tải về các tài liệu đã mua
              </p>
            </div>
            <Link
              to="/student/documents"
              className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Khám phá thêm
            </Link>
          </div>
        </div>

        {/* Toast */}
        {message.content && (
          <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {message.type === 'error' ? '⚠' : '✓'} {message.content}
          </div>
        )}

        {/* Stats bar */}
        {documents.length > 0 && (
          <div className="card p-4 mb-6 fade-in-up">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--amber-soft)' }}>
                  <span className="text-sm">📚</span>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tổng tài liệu</div>
                  <div className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {documents.length}
                  </div>
                </div>
              </div>
              <div className="h-8 w-px" style={{ background: 'var(--border-light)' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-light)' }}>
                  <span className="text-sm">✅</span>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Sẵn sàng tải</div>
                  <div className="font-display font-bold text-sm" style={{ color: 'var(--success)' }}>
                    {documents.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document grid or empty state */}
        {documents.length === 0 ? (
          <div className="card p-12 text-center fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
              <span className="text-3xl">📂</span>
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Bạn chưa mua tài liệu nào
            </h3>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)' }}>
              Khám phá kho tài liệu để tìm tài liệu học tập phù hợp
            </p>
            <Link
              to="/student/documents"
              className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm rounded-xl"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Khám phá kho tài liệu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
            {documents.map((item) => {
              const doc = item.document || item;
              return (
                <div key={doc._id} className="card rounded-2xl overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-32 overflow-hidden">
                    {doc.thumbnailUrl ? (
                      <img
                        src={doc.thumbnailUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: CATEGORY_GRADIENT[doc.category] || CATEGORY_GRADIENT.khác }}
                      >
                        <span className="text-3xl opacity-80">
                          {CATEGORY_ICON[doc.category] || CATEGORY_ICON.khác}
                        </span>
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`badge ${CATEGORY_BADGE[doc.category] || 'badge-gray'}`} style={{ fontSize: '10px' }}>
                        {CATEGORY_MAP[doc.category] || 'Khác'}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Title */}
                    <Link
                      to={`/student/documents/${doc._id}`}
                      className="block"
                    >
                      <h3
                        className="font-semibold text-sm leading-snug line-clamp-2 mb-2 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--amber-warm)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      >
                        {doc.title}
                      </h3>
                    </Link>

                    {/* Purchase date */}
                    {item.purchasedAt && (
                      <div className="text-[10px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Mua ngày {new Date(item.purchasedAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}

                    {/* Download button */}
                    <button
                      onClick={() => handleDownload(doc._id)}
                      disabled={downloadingId === doc._id}
                      className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: downloadingId === doc._id ? 'var(--border-light)' : 'var(--success)',
                        color: downloadingId === doc._id ? 'var(--text-muted)' : 'white',
                        opacity: downloadingId === doc._id ? 0.7 : 1,
                      }}
                    >
                      {downloadingId === doc._id ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Tải về
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MyDocuments;
