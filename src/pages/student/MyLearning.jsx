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

const IconClock = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
  </svg>
);

const IconTarget = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45a.75.75 0 00-1.137.089l-4 5.5a.75.75 0 001.137.089l4-5.5a.75.75 0 00-.137-.089zM11.202 7.45a.75.75 0 011.137.089l.82 1.127a.75.75 0 01-1.214.882l-.82-1.127a.75.75 0 00.077-.971z" clipRule="evenodd" />
  </svg>
);

const IconFire = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M13.5 4.938a7 7 0 11-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 01.572-2.759 6.026 6.026 0 012.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0013.5 4.938zM14 12a4 4 0 01-5.478 3.714c-.253-.09-.37-.404-.222-.623a3.011 3.011 0 00.469-2.223 1.5 1.5 0 001.257.632c.346 0 .658-.145.883-.38a3.517 3.517 0 001.105-2.575c.034-.38.21-.753.562-.996C13.486 10.114 14 10.988 14 12z" clipRule="evenodd" />
  </svg>
);

const IconMegaphone = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M13.92 3.845a19.361 19.361 0 01-6.3 1.98 6.028 6.028 0 00-.11.36l-.194.75c-.6.24-1.15.56-1.64.96A9.17 9.17 0 003.92 9.68c-.22.4-.35.85-.35 1.32 0 .86.4 1.63 1.07 2.17l-.18.71c-.1.39-.02.8.22 1.12l.77.96c.34.42.92.56 1.42.33l1.06-.46c.72.27 1.5.43 2.3.48l.17.66a1 1 0 00.97.75h.76a1 1 0 00.97-.75l.17-.66a6.968 6.968 0 002.29-.48l1.07.46c.5.22 1.07.09 1.41-.33l.77-.96c.24-.31.32-.73.22-1.12l-.18-.71c.67-.54 1.07-1.31 1.07-2.17 0-.47-.13-.92-.35-1.32a9.17 9.17 0 00-1.76-1.79 6.508 6.508 0 00-1.64-.96l-.19-.75a6.032 6.032 0 00-.11-.36 19.358 19.358 0 01-6.3-1.98L10 3l3.92.845z" />
  </svg>
);

// Relative time helper
const timeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
};

const MyLearning = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
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

    const fetchDashboard = async () => {
      try {
        setDashLoading(true);
        const res = await axiosClient.get('/student/dashboard-summary');
        setDashboard(res.data);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setDashLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await axiosClient.get('/announcements');
        setAnnouncements(res.data.announcements || []);
      } catch (error) {
        console.error('Lỗi tải thông báo:', error);
      }
    };

    fetchClasses();
    fetchDashboard();
    fetchAnnouncements();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const importantAnnouncements = announcements.filter(a => a.priority === 'important').slice(0, 2);
  const hasAnnouncements = importantAnnouncements.length > 0;

  return (
    <StudentLayout>
      {/* Page header */}
      <div className="mb-6">
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

      {/* === IMPORTANT ANNOUNCEMENTS BANNER === */}
      {hasAnnouncements && (
        <div className="mb-6 space-y-3 fade-in-up">
          {importantAnnouncements.map(a => (
            <div
              key={a._id}
              className="rounded-2xl p-4 flex items-start gap-3 border"
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
                borderColor: '#fbbf24',
                borderLeftWidth: 4
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#f59e0b', color: '#fff' }}>
                <IconMegaphone />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold" style={{ color: '#92400e' }}>{a.title}</h4>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: '#78350f' }}>{a.content}</p>
                <span className="text-xs mt-1.5 inline-block" style={{ color: '#a16207' }}>
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === DASHBOARD WIDGETS === */}
      {!dashLoading && dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger-children">

          {/* Today's Tasks */}
          <div className="card rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                <IconClock />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Bài tập sắp tới</h3>
            </div>
            <div className="p-4">
              {dashboard.upcomingQuizzes.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  🎉 Không có bài nào đang chờ!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {dashboard.upcomingQuizzes.slice(0, 4).map(q => (
                    <div key={q._id} className="flex items-center gap-3 group">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: q.attemptStatus === 'submitted' ? 'var(--success)' :
                            q.attemptStatus === 'in_progress' ? 'var(--amber-warm)' : 'var(--border)'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{
                          color: 'var(--text-primary)',
                          textDecoration: q.attemptStatus === 'submitted' ? 'line-through' : 'none',
                          opacity: q.attemptStatus === 'submitted' ? 0.5 : 1
                        }}>
                          {q.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {q.classNames?.length > 0 && (
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {q.classNames[0]}
                            </span>
                          )}
                          {q.endTime && (
                            <span className="text-[11px]" style={{ color: 'var(--amber-warm)' }}>
                              · Hạn {new Date(q.endTime).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                      {q.attemptStatus !== 'submitted' && (
                        <Link
                          to="/student/quizzes"
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                        >
                          Làm bài
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* This Week */}
          <div className="card rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#dbeafe', color: '#2563eb' }}>
                <IconFire />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tuần này</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {dashboard.weeklyStats.quizzesCompleted}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Bài hoàn thành
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold" style={{ color: dashboard.weeklyStats.avgScore >= 80 ? '#059669' : dashboard.weeklyStats.avgScore >= 50 ? '#d97706' : '#ef4444' }}>
                    {dashboard.weeklyStats.avgScore}%
                  </div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Điểm TB
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {dashboard.weeklyStats.questionsAnswered}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Câu trả lời
                  </div>
                </div>
              </div>
              {dashboard.weeklyStats.quizzesCompleted === 0 && (
                <p className="text-xs text-center mt-4 py-2 rounded-lg" style={{ background: 'var(--cream-warm)', color: 'var(--text-muted)' }}>
                  Bắt đầu làm bài để xem thống kê!
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#d1fae5', color: '#059669' }}>
                <IconTarget />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hoạt động gần đây</h3>
            </div>
            <div className="p-4">
              {dashboard.recentActivity.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Chưa có hoạt động nào
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboard.recentActivity.map(a => (
                    <div key={a._id} className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: a.percentage >= 80 ? '#d1fae5' : a.percentage >= 50 ? '#fef3c7' : '#fee2e2',
                          color: a.percentage >= 80 ? '#059669' : a.percentage >= 50 ? '#d97706' : '#ef4444'
                        }}
                      >
                        {a.percentage}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {a.quizTitle}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {a.score}/{a.totalQuestions} câu đúng · {timeAgo(a.submittedAt)}
                        </p>
                      </div>
                      <Link
                        to={`/student/quiz-result/${a._id}`}
                        className="text-[11px] font-semibold shrink-0"
                        style={{ color: 'var(--amber-warm)' }}
                      >
                        Xem
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard loading skeleton */}
      {dashLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card rounded-2xl p-5 space-y-3">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

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
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Lớp học của bạn</h2>
          </div>
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
        </>
      )}
    </StudentLayout>
  );
};

export default MyLearning;
