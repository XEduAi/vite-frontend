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
        <div className="py-16 text-center text-sm" style={{ color: '#a8a29e' }}>Đang tải...</div>
      </StudentLayout>
    );
  }

  if (!cls) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold" style={{ color: '#1c1917' }}>Không tìm thấy lớp học</h3>
          <Link to="/student/dashboard" className="text-sm mt-4 inline-flex items-center gap-1 font-medium" style={{ color: '#e8850a' }}>
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

  const getMediaIcon = (type) => ({ video: '📺', image: '🖼️', document: '📄' }[type] || '📄');

  const getMediaBadge = (type) => {
    const config = {
      video: { bg: '#ede9fe', text: '#5b21b6', label: 'Video' },
      image: { bg: '#d1fae5', text: '#065f46', label: 'Hình ảnh' },
      document: { bg: '#fef3c7', text: '#92400e', label: 'Tài liệu' },
    };
    const c = config[type] || { bg: '#f3f4f6', text: '#374151', label: type };
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: c.bg, color: c.text }}>
        {c.label}
      </span>
    );
  };

  const isPreviewable = (media) =>
    media.type === 'video' || media.type === 'image' || media.url?.endsWith('.pdf');

  return (
    <StudentLayout>
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: '#78716c' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e8850a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#78716c'}
        >
          <IconBack /> Lớp học của tôi
        </Link>
      </div>

      {/* Class header */}
      <div
        className="bg-white rounded-2xl border p-6 mb-4"
        style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.07)' }}
      >
        <h1 className="font-display text-2xl font-semibold" style={{ color: '#1c1917' }}>{cls.name}</h1>
        {cls.description && (
          <p className="text-sm mt-2 leading-relaxed" style={{ color: '#78716c' }}>{cls.description}</p>
        )}

        {/* Schedule */}
        {cls.scheduleTemplate && cls.scheduleTemplate.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-medium" style={{ color: '#a8a29e' }}>Lịch học:</span>
            {cls.scheduleTemplate.map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(232,133,10,0.08)', color: '#e8850a' }}
              >
                {DAYS[s.day]} — {s.time} ({s.duration} phút)
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div
          className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t text-sm"
          style={{ borderColor: '#f0ebe4' }}
        >
          <span className="flex items-center gap-1.5" style={{ color: '#78716c' }}>
            📄 <span className="font-semibold" style={{ color: '#1c1917' }}>{mediaCounts.document}</span> tài liệu
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#78716c' }}>
            📺 <span className="font-semibold" style={{ color: '#1c1917' }}>{mediaCounts.video}</span> video
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#78716c' }}>
            🖼️ <span className="font-semibold" style={{ color: '#1c1917' }}>{mediaCounts.image}</span> hình ảnh
          </span>
        </div>
      </div>

      {/* Media section */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.07)' }}
      >
        {/* Tabs */}
        <div className="border-b px-4 pt-1" style={{ borderColor: '#f0ebe4' }}>
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'video', label: 'Video' },
              { key: 'document', label: 'Tài liệu' },
              { key: 'image', label: 'Hình ảnh' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#e8850a]'
                    : 'border-transparent'
                }`}
                style={{ color: activeTab === tab.key ? '#e8850a' : '#a8a29e' }}
              >
                {tab.label}
                {mediaCounts[tab.key] > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={
                      activeTab === tab.key
                        ? { background: 'rgba(232,133,10,0.12)', color: '#e8850a' }
                        : { background: '#f0ebe4', color: '#a8a29e' }
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
            <div className="py-14 text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm" style={{ color: '#a8a29e' }}>Chưa có nội dung nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMedia.map((media) => (
                <div
                  key={media._id}
                  className="flex items-center gap-3.5 p-4 rounded-xl border transition-all group"
                  style={{ borderColor: '#f0ebe4', background: '#faf7f2' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#e8850a';
                    e.currentTarget.style.background = 'rgba(232,133,10,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f0ebe4';
                    e.currentTarget.style.background = '#faf7f2';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    {getMediaIcon(media.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" style={{ color: '#1c1917' }}>{media.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getMediaBadge(media.type)}
                      {media.createdAt && (
                        <span className="text-xs" style={{ color: '#a8a29e' }}>
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
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(232,133,10,0.1)', color: '#e8850a' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232,133,10,0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(232,133,10,0.1)'}
                      >
                        <IconEye /> Xem
                      </button>
                    )}
                    <a
                      href={media.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(20,33,61,0.07)', color: '#14213d' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20,33,61,0.13)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20,33,61,0.07)'}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl fade-in"
            style={{ maxHeight: '90vh', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#f0ebe4' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{getMediaIcon(previewMedia.type)}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color: '#1c1917' }}>{previewMedia.title}</h3>
                  <div className="mt-0.5">{getMediaBadge(previewMedia.type)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={previewMedia.url} target="_blank" rel="noreferrer"
                  className="text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: '#e8850a' }}
                >
                  Mở tab mới ↗
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: '#a8a29e', background: '#f0ebe4' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#1c1917'; e.currentTarget.style.background = '#e5ddd0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a8a29e'; e.currentTarget.style.background = '#f0ebe4'; }}
                >
                  <IconX />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 76px)', background: '#1a1a1a' }}>
              {previewMedia.type === 'video' && (
                <video
                  src={previewMedia.url} controls autoPlay
                  className="w-full" style={{ maxHeight: '75vh' }}
                >
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
              {previewMedia.type === 'image' && (
                <div className="flex items-center justify-center p-4">
                  <img
                    src={previewMedia.url} alt={previewMedia.title}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '75vh' }}
                  />
                </div>
              )}
              {previewMedia.type === 'document' && previewMedia.url?.endsWith('.pdf') && (
                <iframe
                  src={previewMedia.url} title={previewMedia.title}
                  className="w-full"
                  style={{ height: '75vh', border: 'none' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default ClassDetail;
