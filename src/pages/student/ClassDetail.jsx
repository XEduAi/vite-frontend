import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const DAYS = ['', 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const IconBack = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

const ClassDetail = () => {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [previewMedia, setPreviewMedia] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/classes/${id}`);
        setCls(res.data.class);
      } catch (error) {
        console.error('Lỗi tải lớp:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải lớp học...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!cls) {
    return (
      <StudentLayout>
        <div className="py-20 text-center fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-5" style={{ background: 'var(--danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--danger)' }}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Không tìm thấy lớp học</h3>
          <Link to="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4 btn-secondary">
            <IconBack /> Quay lại
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const mediaList = cls.mediaResources || [];
  const filteredMedia = activeTab === 'all' ? mediaList : mediaList.filter(m => m.type === activeTab);
  const mediaCounts = {
    all: mediaList.length,
    video: mediaList.filter(m => m.type === 'video').length,
    document: mediaList.filter(m => m.type === 'document').length,
    image: mediaList.filter(m => m.type === 'image').length,
  };

  const getMediaIcon = (type) => {
    const icons = {
      video: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#8b5cf6' }}>
          <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
        </svg>
      ),
      image: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#10b981' }}>
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.22-4.22a.75.75 0 00-1.06 0L2.5 11.06z" clipRule="evenodd" />
        </svg>
      ),
      document: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#f59e0b' }}>
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
        </svg>
      ),
    };
    return icons[type] || icons.document;
  };

  const getMediaBadge = (type) => {
    const config = {
      video: { cls: 'badge-purple', label: 'Video' },
      image: { cls: 'badge-green', label: 'Hình ảnh' },
      document: { cls: 'badge-amber', label: 'Tài liệu' },
    };
    const c = config[type] || { cls: 'badge-gray', label: type };
    return <span className={`badge ${c.cls}`}>{c.label}</span>;
  };

  const isPreviewable = (media) =>
    media.type === 'video' || media.type === 'image' || media.url?.endsWith('.pdf');

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'video', label: 'Video' },
    { key: 'document', label: 'Tài liệu' },
    { key: 'image', label: 'Hình ảnh' },
  ];

  return (
    <StudentLayout>
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-all rounded-lg px-2 py-1 -ml-2"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--amber-warm)'; e.currentTarget.style.background = 'var(--amber-soft)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <IconBack /> Lớp học của tôi
        </Link>
      </div>

      {/* Class header */}
      <div className="card p-6 md:p-8 mb-5 fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{cls.name}</h1>
        {cls.description && (
          <p className="text-sm mt-3 leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{cls.description}</p>
        )}

        {/* Schedule */}
        {cls.scheduleTemplate && cls.scheduleTemplate.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Lịch học</span>
            {cls.scheduleTemplate.map((s, i) => (
              <span key={i} className="badge badge-amber">
                {DAYS[s.day]} — {s.time} ({s.duration} phút)
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border-light)' }}>
          {[
            { icon: getMediaIcon('document'), count: mediaCounts.document, label: 'tài liệu' },
            { icon: getMediaIcon('video'), count: mediaCounts.video, label: 'video' },
            { icon: getMediaIcon('image'), count: mediaCounts.image, label: 'hình ảnh' },
          ].map((stat, i) => (
            <span key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stat.icon}
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stat.count}</span>
              {stat.label}
            </span>
          ))}
        </div>
      </div>

      {/* Media section */}
      <div className="card overflow-hidden fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Tabs */}
        <div className="border-b px-5 pt-2" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key ? 'tab-active' : 'border-transparent'
                }`}
                style={{ color: activeTab === tab.key ? 'var(--amber-warm)' : 'var(--text-muted)' }}
              >
                {tab.label}
                {mediaCounts[tab.key] > 0 && (
                  <span
                    className="badge"
                    style={
                      activeTab === tab.key
                        ? { background: 'var(--amber-soft)', color: 'var(--amber-warm)' }
                        : { background: '#f1f5f9', color: 'var(--text-muted)' }
                    }
                  >
                    {mediaCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Media grid */}
        <div className="p-5">
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f1f5f9' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--text-muted)' }}>
                  <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Chưa có nội dung nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
              {filteredMedia.map((media) => (
                <div
                  key={media._id}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all group"
                  style={{ borderColor: 'var(--border-light)', background: 'var(--cream)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                    e.currentTarget.style.background = 'var(--amber-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.background = 'var(--cream)';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    {getMediaIcon(media.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{media.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      {getMediaBadge(media.type)}
                      {media.createdAt && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(media.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {isPreviewable(media) && (
                      <button
                        onClick={() => setPreviewMedia(media)}
                        className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg"
                        style={{ color: 'var(--amber-warm)', background: 'var(--amber-soft)' }}
                      >
                        <IconEye /> Xem
                      </button>
                    )}
                    <a
                      href={media.url} target="_blank" rel="noreferrer"
                      className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg"
                      style={{ color: 'var(--navy)', background: 'rgba(10,22,40,0.06)' }}
                    >
                      <IconDownload /> Tải
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl modal-content"
            style={{ maxHeight: '90vh', boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--cream)' }}>
                  {getMediaIcon(previewMedia.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{previewMedia.title}</h3>
                  <div className="mt-0.5">{getMediaBadge(previewMedia.type)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={previewMedia.url} target="_blank" rel="noreferrer"
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--amber-warm)' }}
                >
                  Mở tab mới
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z" />
                    <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 007 4H4.75A2.75 2.75 0 002 6.75v4.5A2.75 2.75 0 004.75 14h4.5A2.75 2.75 0 0012 11.25V9a.75.75 0 00-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5z" />
                  </svg>
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)', background: '#f1f5f9' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <IconX />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 76px)', background: '#0f172a' }}>
              {previewMedia.type === 'video' && (
                <video src={previewMedia.url} controls autoPlay className="w-full" style={{ maxHeight: '75vh' }}>
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
              {previewMedia.type === 'image' && (
                <div className="flex items-center justify-center p-4">
                  <img src={previewMedia.url} alt={previewMedia.title} className="max-w-full h-auto rounded-lg" style={{ maxHeight: '75vh' }} />
                </div>
              )}
              {previewMedia.type === 'document' && previewMedia.url?.endsWith('.pdf') && (
                <iframe src={previewMedia.url} title={previewMedia.title} className="w-full" style={{ height: '75vh', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default ClassDetail;
