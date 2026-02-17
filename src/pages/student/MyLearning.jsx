import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const DAYS = ['', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Warm color pairs (bg, text, accent)
const CLASS_COLORS = [
  { bg: '#14213d', text: '#ffffff', accent: '#e8850a' },
  { bg: '#065f46', text: '#ffffff', accent: '#34d399' },
  { bg: '#1e3a5f', text: '#ffffff', accent: '#60a5fa' },
  { bg: '#5b21b6', text: '#ffffff', accent: '#c4b5fd' },
  { bg: '#92400e', text: '#ffffff', accent: '#fbbf24' },
  { bg: '#831843', text: '#ffffff', accent: '#f9a8d4' },
];

const IconArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
  </svg>
);

const MyLearning = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const fullName = localStorage.getItem('fullName') || 'Học viên';

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/my-classes');
        setClasses(res.data.classes || []);
      } catch (error) {
        console.error('Lỗi tải lớp học:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <StudentLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold" style={{ color: '#1c1917' }}>
          Xin chào, {fullName.split(' ').pop()} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>
          {loading ? '...' : `${classes.length} lớp học đang theo học`}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#e5ddd0' }}>
              <div style={{ height: 120, background: '#d6ccc0' }} />
              <div className="p-5 space-y-2.5" style={{ background: '#f0ebe4' }}>
                <div className="h-3 rounded-full w-2/3" style={{ background: '#d6ccc0' }} />
                <div className="h-3 rounded-full w-full" style={{ background: '#d6ccc0' }} />
                <div className="h-3 rounded-full w-1/2" style={{ background: '#d6ccc0' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && classes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
            style={{ background: '#f0ebe4' }}
          >
            📚
          </div>
          <h3 className="font-semibold text-lg" style={{ color: '#1c1917' }}>Chưa có lớp học nào</h3>
          <p className="text-sm mt-2 max-w-xs" style={{ color: '#78716c' }}>
            Hãy liên hệ giáo viên hoặc quản trị viên để được ghi danh vào lớp
          </p>
        </div>
      )}

      {/* Class grid */}
      {!loading && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, index) => {
            const colors = CLASS_COLORS[index % CLASS_COLORS.length];
            return (
              <Link
                key={cls._id}
                to={`/student/class/${cls._id}`}
                className="group rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: '#e5ddd0',
                  boxShadow: '0 1px 3px rgba(160,100,20,0.07)',
                  background: '#ffffff',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(160,100,20,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(160,100,20,0.07)'}
              >
                {/* Color banner */}
                <div
                  className="relative h-28 p-5 flex flex-col justify-end overflow-hidden"
                  style={{ background: colors.bg }}
                >
                  {/* Decorative circle */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                    style={{ background: colors.accent, opacity: 0.1 }}
                  />
                  <div
                    className="absolute -bottom-12 -right-4 w-24 h-24 rounded-full"
                    style={{ background: colors.accent, opacity: 0.08 }}
                  />
                  {/* Media count badge */}
                  {cls.mediaResources?.length > 0 && (
                    <div
                      className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.15)', color: colors.accent }}
                    >
                      {cls.mediaResources.length} tài liệu
                    </div>
                  )}
                  <h3
                    className="font-display text-white font-semibold text-base leading-tight relative z-10 group-hover:translate-x-0.5 transition-transform"
                  >
                    {cls.name}
                  </h3>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: '#78716c' }}>
                    {cls.description || 'Chưa có mô tả'}
                  </p>

                  {/* Schedule */}
                  {cls.scheduleTemplate && cls.scheduleTemplate.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cls.scheduleTemplate.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: '#f0ebe4', color: '#78716c' }}
                        >
                          <IconCalendar />
                          {DAYS[s.day]} {s.time}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div
                    className="flex items-center justify-between text-xs font-medium pt-3 border-t"
                    style={{ borderColor: '#f0ebe4' }}
                  >
                    <span style={{ color: '#a8a29e' }}>
                      📄 {cls.mediaResources?.length || 0} tài nguyên
                    </span>
                    <span
                      className="flex items-center gap-1 group-hover:gap-1.5 transition-all"
                      style={{ color: '#e8850a' }}
                    >
                      Xem lớp <IconArrow />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
};

export default MyLearning;
