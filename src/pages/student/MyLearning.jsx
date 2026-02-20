import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const DAYS = ['', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const CLASS_COLORS = [
  { bg: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', accent: '#f59e0b' },
  { bg: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', accent: '#34d399' },
  { bg: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', accent: '#a78bfa' },
  { bg: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', accent: '#fbbf24' },
  { bg: 'linear-gradient(135deg, #701a75 0%, #a21caf 100%)', accent: '#f0abfc' },
  { bg: 'linear-gradient(135deg, #1e3a5f 0%, #0369a1 100%)', accent: '#38bdf8' },
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

const IconFolder = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75z" />
    <path d="M3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" />
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <StudentLayout>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium" style={{ color: 'var(--amber-warm)' }}>
            {getGreeting()}
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {fullName.split(' ').pop()} oi, học gì hôm nay?
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Đang tải...' : `Bạn đang theo học ${classes.length} lớp`}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton" style={{ height: 140 }} />
              <div className="p-5 space-y-3" style={{ background: 'var(--white)', borderRadius: '0 0 16px 16px' }}>
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && classes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center fade-in-up">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 rotate-3"
            style={{ background: 'var(--amber-soft)', boxShadow: 'var(--shadow-glow)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" style={{ color: 'var(--amber-warm)' }}>
              <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Chưa có lớp học nào</h3>
          <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Hãy liên hệ giáo viên hoặc quản trị viên để được ghi danh vào lớp học
          </p>
        </div>
      )}

      {/* Class grid */}
      {!loading && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {classes.map((cls, index) => {
            const colors = CLASS_COLORS[index % CLASS_COLORS.length];
            return (
              <Link
                key={cls._id}
                to={`/student/class/${cls._id}`}
                className="card-interactive group rounded-2xl overflow-hidden"
              >
                {/* Color banner */}
                <div
                  className="relative h-32 p-5 flex flex-col justify-end overflow-hidden"
                  style={{ background: colors.bg }}
                >
                  {/* Decorative elements */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                    style={{ background: colors.accent, opacity: 0.08 }}
                  />
                  <div
                    className="absolute -bottom-14 -right-6 w-28 h-28 rounded-full"
                    style={{ background: colors.accent, opacity: 0.06 }}
                  />
                  <div
                    className="absolute top-4 left-4 w-12 h-12 rounded-xl rotate-12"
                    style={{ border: `1px solid ${colors.accent}`, opacity: 0.1 }}
                  />

                  {/* Media count badge */}
                  {cls.mediaResources?.length > 0 && (
                    <div
                      className="absolute top-4 right-4 badge"
                      style={{ background: 'rgba(255,255,255,0.12)', color: colors.accent, backdropFilter: 'blur(8px)' }}
                    >
                      <IconFolder />
                      {cls.mediaResources.length} tài liệu
                    </div>
                  )}

                  <h3 className="font-display text-white font-bold text-lg leading-tight relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {cls.name}
                  </h3>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {cls.description || 'Chưa có mô tả'}
                  </p>

                  {/* Schedule */}
                  {cls.scheduleTemplate && cls.scheduleTemplate.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cls.scheduleTemplate.map((s, i) => (
                        <span
                          key={i}
                          className="badge badge-gray"
                        >
                          <IconCalendar />
                          {DAYS[s.day]} {s.time}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div
                    className="flex items-center justify-between text-xs font-semibold pt-4 border-t"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <IconFolder />
                      {cls.mediaResources?.length || 0} tài nguyên
                    </span>
                    <span
                      className="flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
                      style={{ color: 'var(--amber-warm)' }}
                    >
                      Vào lớp <IconArrow />
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
